
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL DEFAULT 'SUPPORT_CHAT',
    content TEXT NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE purchase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    previous_purchase_id UUID REFERENCES purchase(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING',
    order_item JSONB, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchase(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    operation_type VARCHAR(20) NOT NULL,
    previous_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    new_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_delta NUMERIC(12, 2) GENERATED ALWAYS AS (new_amount - previous_amount) STORED,
    previous_hash VARCHAR(64) NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    reason  TEXT NOT NULL,
    action_by VARCHAR(100) NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE INDEX idx_interactions_vector_hnsw 
ON interactions USING hnsw (embedding vector_cosine_ops);


CREATE USER mcp_user WITH PASSWORD 'postgres';

GRANT CONNECT ON DATABASE mcp_db TO mcp_user;
GRANT USAGE ON SCHEMA public TO  mcp_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO  mcp_user;
GRANT INSERT ON interactions TO  mcp_user;
GRANT INSERT on purchase TO mcp_user;
GRANT UPDATE (status) ON purchase TO mcp_user;

REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;



CREATE OR REPLACE FUNCTION purchase_append_only()
RETURNS TRIGGER AS $$
BEGIN 
    IF (TG_OP = 'DELETE') THEN
        RAISE EXCEPTION 'Deleting purchase records is not allowed (Append-Only Table).';
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        IF (OLD.id IS DISTINCT FROM NEW.id) OR
           (OLD.customer_id IS DISTINCT FROM NEW.customer_id) OR
           (OLD.total_amount IS DISTINCT FROM NEW.total_amount) OR
           (OLD.order_item IS DISTINCT FROM NEW.order_item) OR
           (OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
             RAISE EXCEPTION 'Only status column can be updated in purchase table.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_purchase_append_only
BEFORE UPDATE OR DELETE ON purchase
FOR EACH ROW
EXECUTE FUNCTION purchase_append_only();