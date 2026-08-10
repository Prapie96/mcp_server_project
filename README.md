# Overview

ระบบนี้ออกแบบและพัฒนาขึ้นเพื่อทำหน้าที่เป็น MCP (Model Context Protocol) Server ตรงกลางระหว่าง LLM (Large Language Model) และระบบฐานข้อมูลลูกค้า (PostgreSQL)
เพื่อสนับสนุนการตอบคำถามแบบ Hybrid Query (ผสมผสานระหว่าง Unstructured Semantic Context และ Structured Live Financial Data)

## System & Security Architecture Document

 <img width="3244" height="1444" alt="image" src="https://github.com/user-attachments/assets/376febad-05f4-4183-b71a-3a60c1d1a190" />

## Stack

### Node.js TypeScript

- Type Safety สูง, มี SDK MCP อย่างเป็นทางการจาก Anthropic โดยตรง

### PostgreSQL

- มี Extention pgVector สำหรับการทำ Vector Database
- รวม Relational Database (SQL Aggregation) และ Vector Store (Semantic Search) ไว้ใน Database เดียว ช่วยลดความซับซ้อน

### Embedding : huggingface/transformers model Xenova/all-MiniLM-L6-v2

- สามารถ run local ai ผ่านตัว node ได้ใช้พื้นที่ไม่เยอะในการติดตั้งตัว Model
- Model Xenova/all-MiniLM-L6-v2 รองรับการทำ Embedding ที่ Dimension 384 ไม่ต้องต่อ API ภายนอกและ COST = 0

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

## MCP Tools

MCP Tools & Prompts Reference
search_customer_info / search_customer: ค้นหาข้อมูลพื้นฐานลูกค้า

save_customer_interaction: บันทึกประวัติการสนทนาพร้อมแปลงเป็น Vector Embedding ลงตาราง interactions

search_history_interaction: ค้นหาประวัติการสนทนาแบบ Semantic Search

search_customer_purchase: ดึงประวัติการสั่งซื้อของ Customer

calculate_customer_purchase: คำนวณยอดรวมการใช้จ่ายของ Customer

## How to Installation

1. git clone https://github.com/Prapie96/mcp_server_project
2. cd mcp_customer_chat
3. docker compose up -d --build
4. docker compose ps
5. ต่อ mcp server เข้ากับ LLM Interface
   ```bash
    {
      "mcpServers": {
        "customer-service-docker": {
          "command": "docker",
          "args": [
            "exec",
            "-i",
            "mcp_customer_server",
            "node",
            "dist/index.js"
          ]
        }
      }
    }
   ```

## How to Installation (Alternative) run PostgreSQL on Docker run MCP Server on Local

1. git clone https://github.com/Prapie96/mcp_server_project
2. cd mcp_customer_chat
3. docker compose up -d mcp_postgres
4. npm install
5. npm run build
6. npm run start
7. ต่อ mcp server เข้ากับ LLM Interface
   ```bash
    {
      "mcpServers": {
        "customer-service-docker": {
          "command": "docker",
          "args": [
            "exec",
            "-i",
            "mcp_customer_server",
            "node",
            "dist/index.js"
          ]
        }
      }
    }
   ```
