-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Core Entities
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Interaction History (Vector / RAG Support)
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL DEFAULT 'SUPPORT_CHAT',
    content TEXT NOT NULL,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Table
CREATE TABLE purchase (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'PENDING',
    order_item JSONB, 
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchase(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    type VARCHAR(20),
    previous_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    new_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    amount_delta NUMERIC(12, 2) GENERATED ALWAYS AS (new_amount - previous_amount) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- High-Performance Indexing
CREATE INDEX idx_interactions_vector_hnsw 
ON interactions USING hnsw (embedding vector_cosine_ops);


CREATE USER mcp_readonly_user WITH PASSWORD 'postgres';

GRANT CONNECT ON DATABASE mcp_db TO mcp_readonly_user;
GRANT USAGE ON SCHEMA public TO mcp_readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly_user;
GRANT INSERT ON interactions TO mcp_readonly_user;
-- User and Permissions
-- CREATE USER mcp_readonly_user WITH PASSWORD 'postgres';
-- GRANT CONNECT ON DATABASE mcp_db TO mcp_readonly_user;
-- GRANT USAGE ON SCHEMA public TO mcp_readonly_user;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO mcp_readonly_user;
-- GRANT INSERT ON TABLE interactions TO mcp_readonly_user;
-- GRANT INSERT ON TABLE purchase TO mcp_readonly_user;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO mcp_readonly_user;