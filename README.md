# Overview

ระบบนี้ออกแบบและพัฒนาขึ้นเพื่อทำหน้าที่เป็น MCP (Model Context Protocol) Server ตรงกลางระหว่าง LLM (Large Language Model) และระบบฐานข้อมูล (PostgreSQL)
เพื่อสนับสนุนการตอบคำถามแบบ Hybrid Query (ผสมผสานระหว่าง Semantic Context Live Data/Exact Amount จากประวัติการซื้อ (SQL Aggregation))

## System & Security Architecture Document

<img width="1696" height="2688" alt="image" src="https://github.com/user-attachments/assets/4d4d8d5f-f920-4205-a51b-b8a4507e7145" />

## Stacks

### Node.js TypeScript

- Type Safety สูง, มี SDK MCP อย่างเป็นทางการจาก Anthropic โดยตรง

### PostgreSQL

- มี Extention pgVector สำหรับการทำ Vector Database
- รวม Relational Database และ Vector Store (Semantic Search) ไว้ใน Database เดียว ช่วยลดความซับซ้อน

### Embedding : huggingface/transformers model Xenova/all-MiniLM-L6-v2

- สามารถ run Model Ai จากทางhuggingface ให้สามารถใช้งานภายใน node ได้ใช้พื้นที่ไม่เยอะในการติดตั้งตัว Model และไม่ต้องต่อ API ภายนอก
- Model Xenova/all-MiniLM-L6-v2 รองรับการทำ Embedding ที่ Dimension 384

### MCP Transport stdio

- ไม่ต้องเปิด PUBLIC PORT แยกขึ้นมารองรับ
- run แบบ Local Host Process

### Zod Validation

- แนะนำโดย Anthropic ใน Documentation
- สามารถกำหนด Type ของ Parameters ที่จะเข้ามาได้

## Security Guardrails

### Parameter Isolation & No Dynamic SQL

- ไม่ให้ LLM ทำการรับคำสั่ง SQL เข้ามาแล้วส่งมาให้ Tools
- กำหนด Tools ให้รับ Parameter แบบเจาะจงด้วย Zod Validation แทนการรับ SQL โดยตรง
- ใช้ Parameterized Queries / Prepared Statements ($1,$2) ในการรับข้อมูลเพื่อติดต่อกับฐานข้อมูล เพื่อป้องกัน SQL Injection

#### ROLE DATABASE & Access

- จำกัดสิทธิ์ของ User ที่ MCP Server ต่อกับ Database
- กำหนดสิทธิ์ user ที่สร้างขึ้นใหม่ใน Database ไม่ให้สามารถ UPDATE,DELETE TAble ได้

## Database Schema

ฐานข้อมูลออกแบบบน **PostgreSQL** โดยรองรับทั้ง **Relational Structured Data**, **Vector Embeddings (RAG)** และ **Immutable Financial Audit Trail**

### 1. SCHEMA TABLES

```bash
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

```

### 2. Financial Auditability

#### Cryptographic Chaining

ตาราง audit_logs ใช้หลักการ Hash Chaining (คล้ายกับโครงสร้างของ Blockchain) โดยทุกๆ แถวใหม่จะเก็บบันทึกค่า Hash ของแถวก่อนหน้าไว้ในฟิลด์ previous_hash และคำนวณ Hash ของตัวเองเก็บไว้ใน current_hash
หากมีการพยายามแก้ไขข้อมูลในแถวที่ 2 ค่า current_hash ของแถวที่ 2 จะเปลี่ยนไปจากเดิมทันทีเมื่อคำนวณใหม่ แต่เนื่องจากแถวที่ 3 ถูกล็อกไว้ด้วยค่า previous_hash ที่อ้างอิงถึงค่าเก่าของแถวที่ 2 ทำให้รู้ได้ว่ามีการเปลี่ยนแปลงเกิดขึ้น
เพราะว่า hash chain ไม่ต่อกัน

#### Append Rows only / Access User in Database Puschase & Audit Logs

#### purchase Table

1. จำกัดสิทธิ์การใช้งานฐานข้อมูลให้สามารถ UPDATE ได้เฉพาะฟิลด์ status เท่านั้น (เช่น เปลี่ยนจาก PENDING เป็น COMPLETED)ไม่สามารถ UPDATE ข้อมูลทางการเงินหรือรายการสินค้าเด็ดขาด และ ไม่สามารถ DELETE แถวข้อมูล
2. หากมีการเปลี่ยนแปลงยอดเงินหรือรายการสั่งซื้อ จะต้องทำการ INSERT แถวใหม่ เข้าไปเสมอ โดยอ้างอิงกลับไปยังรายการเดิมผ่าน previous_purchase_id ทำให้เราสามารถ Tracking ประวัติย้อนหลังของธุรกรรมทั้งหมดได้

#### audit_logs

1. จำกัดสิทธิ์การใช้งานฐานข้อมูลไม่ให้สามารถ UPDATE หรือ DELETE ค่าหรือแถวได้
2. ให้สิทธ์ในการ SELECT และ INSERT ROW เวลา purchase มีการเปลี่ยนแปลงเท่านั้น

## MCP Tools

MCP Tools & Prompts Reference

- search_customer_info: ค้นหาข้อมูลพื้นฐานลูกค้า
  - ตัวอย่าง "ขอข้อมูลลูกค้าที่ชื่อ สมชาย หน่อย"
- save_customer_interaction: บันทึกประวัติการสนทนาพร้อมแปลงเป็น Vector Embedding ลงตาราง interactions
  - ตัวอย่าง "ลูกค้าแจ้งมาว่า ได้รับของไม่ครบตามที่สั่ง"
- search_history_interaction: ค้นหาประวัติการสนทนาแบบ Semantic Search
  - ตัวอย่าง "มีลูกค้าคนไหนที่แจ้งมาไหมว่าได้ของไม่ครบถ้วน"
- search_customer_purchase: ดึงประวัติการสั่งซื้อของ Customer
  - ตัวอย่าง "ค้นหาประวัติการซื้อของลูกค้าที่ชื่อ สมชายให้หน่อย"
- calculate_customer_purchase: คำนวณยอดรวมการใช้จ่ายของ Customer
  - ตัวอย่าง "คำนวณการซื้อทั้งหมดของลูกค้า สมชายให้หน่อย"
- get_audit_logs : ดูประวัติธุรกรรมการเงิน
  - ตัวอย่าง "ตรวจสอบธุรกรรมการเงินให้หน่อย"

 LLM จะทำการตัดสินใจเรียก Tool ต่างๆตามที่ User ส่งเข้ามา

## How to Installation

```bash
git clone https://github.com/Prapie96/mcp_server_project
```

```bash
 cd mcp_customer_chat
```

```bash
docker compose up -d --build
```

```bash
 docker compose ps
```

ต่อ mcp server เข้ากับ LLM Interface

```bash
  {
   "mcpServers": {
     "mcp-customer-chat": {
       "command": "docker",
       "args": [
         "exec",
         "-i",
         "mcp_node_server",
         "node",
         "build/index.js"
       ]
     }
   }
 }
```

## How to Installation (Alternative) run PostgreSQL on Docker run MCP Server on Local

```bash
 git clone https://github.com/Prapie96/mcp_server_project
```

```bash
  cd mcp_customer_chat
```

```bash
  docker compose up -d mcp_postgres
```

```bash
  npm install
```

```bash
  npm run build
```

```bash
  npm run start
```

ต่อ mcp server เข้ากับ LLM Interface

```bash
  {
   "mcpServers": {
     "mcp-customer-chat": {
       "command": "node",
       "args": [
         "/path/to/mcp_customer_chat/build/index.js"
       ],
       "env": {
         "DATABASE_URL":"postgresql://mcp_user:postgres@localhost:5432/mcp_db"
       }
     }
   }
 }
```
