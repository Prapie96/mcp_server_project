CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS seven_eleven;
CREATE SCHEMA IF NOT EXISTS lotus;
CREATE SCHEMA IF NOT EXISTS cj_more;

SET search_path to public;

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


-- 2. สร้าง Function สำหรับ audit_logs
CREATE OR REPLACE FUNCTION audit_logs_append_only()
RETURNS TRIGGER AS $$
BEGIN
    IF(TG_OP = 'DELETE') THEN
        RAISE EXCEPTION 'Deleting audit_logs records is not allowed (Append-Only Table).';
    END IF;

    IF(TG_OP = 'UPDATE') THEN
        RAISE EXCEPTION 'UPDATING audit_logs records is not allowed (Append-Only Table).';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



-- ==========================================
-- TENANT 1: seven_eleven
-- ==========================================
SET search_path to seven_eleven, public;

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

CREATE INDEX idx_interactions_vector_hnsw_seven
ON interactions USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER trg_purchase_append_only
BEFORE UPDATE OR DELETE ON purchase 
FOR EACH ROW EXECUTE FUNCTION public.purchase_append_only();

CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.audit_logs_append_only();


-- ==========================================
-- TENANT 2: lotus
-- ==========================================
SET search_path to lotus, public;

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

CREATE INDEX idx_interactions_vector_hnsw_lotus 
ON interactions USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER trg_purchase_append_only
BEFORE UPDATE OR DELETE ON purchase 
FOR EACH ROW EXECUTE FUNCTION public.purchase_append_only();

CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.audit_logs_append_only();


-- ==========================================
-- TENANT 3: cj_more
-- ==========================================
SET search_path to cj_more, public;

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

CREATE INDEX idx_interactions_vector_hnsw_cj 
ON interactions USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER trg_purchase_append_only
BEFORE UPDATE OR DELETE ON purchase 
FOR EACH ROW EXECUTE FUNCTION public.purchase_append_only();

CREATE TRIGGER trg_audit_logs_append_only
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.audit_logs_append_only();


-- ==========================================
-- CREATE USER & GRANT PRIVILEGES
-- ==========================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'mcp_user') THEN
    CREATE USER mcp_user WITH PASSWORD 'postgres';
  END IF;
END $$;

-- -- GRANT CONNECT 
GRANT CONNECT ON DATABASE mcp_db TO mcp_user;

-- GRANT USAGE EVERY SCHEMA
GRANT USAGE ON SCHEMA seven_eleven TO mcp_user;
GRANT USAGE ON SCHEMA lotus TO mcp_user;
GRANT USAGE ON SCHEMA cj_more TO mcp_user;

-- GRANT SELECT 
GRANT SELECT ON ALL TABLES IN SCHEMA seven_eleven TO mcp_user;
GRANT SELECT ON ALL TABLES IN SCHEMA lotus TO mcp_user;
GRANT SELECT ON ALL TABLES IN SCHEMA cj_more TO mcp_user;

-- GRANT INSERT ALL interaction TABLE EVERY SCHEMA
GRANT INSERT ON seven_eleven.interactions TO mcp_user;
GRANT INSERT ON lotus.interactions TO mcp_user;
GRANT INSERT ON cj_more.interactions TO mcp_user;

-- REVOKE UPDATE DELETE audit_logs 
REVOKE UPDATE, DELETE ON seven_eleven.audit_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON lotus.audit_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON cj_more.audit_logs FROM PUBLIC;