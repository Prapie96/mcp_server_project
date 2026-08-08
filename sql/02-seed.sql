-- 1. Customers (5 Rows)
INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'สมชาย', 'ใจดี', 'somchai.j@example.com', '0812345678'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Suda', 'Srisuk', 'suda.s@example.com', '0823456789'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ณเดชน์', 'คูกิมิยะ', 'nadech.k@example.com', '0834567890'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Urassaya', 'Sperbund', 'yaya.s@example.com', '0845678901'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'ประยุทธ์', 'จันทร์โอชา', 'prayut.c@example.com', '0856789012');

-- 2. Interactions (5 Rows)
-- INSERT INTO interactions (id, customer_id, interaction_type, content, embedding) VALUES
-- ('111bc999-9c0b-4ef8-bb6d-6bb9bd380b01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SUPPORT_CHAT', 'ลูกค้าสอบถามเรื่องการขอคืนเงินเนื่องจากสินค้าชำรุด', NULL),
-- ('222bc999-9c0b-4ef8-bb6d-6bb9bd380b02', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'EMAIL', 'ติดตามสถานะการจัดส่งสินค้าพรีออเดอร์รอบเดือนพฤษภาคม', NULL),
-- ('333bc999-9c0b-4ef8-bb6d-6bb9bd380b03', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'CALL_TRANSCRIPT', 'ลูกค้าต้องการเปลี่ยนที่อยู่ในการจัดส่งสินค้าด่วน', NULL),
-- ('444bc999-9c0b-4ef8-bb6d-6bb9bd380b04', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'SUPPORT_CHAT', 'สอบถามวิธีใช้งานฟังก์ชันเชื่อมต่อระบบ API กับภายนอก', NULL),
-- ('555bc999-9c0b-4ef8-bb6d-6bb9bd380b05', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'EMAIL', 'แจ้งปัญหาการชำระเงินผ่านบัตรเครดิตไม่ผ่าน', NULL);

-- 3. Purchase (5 Rows)
INSERT INTO purchase (id, customer_id, total_amount, status, order_item) VALUES
('1d4939cc-89e1-400b-967e-9f6a55ff0319', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1500.00, 'COMPLETED', '[{"product": "Mouse Logitech G304", "qty": 1, "price": 1500.00}]'::jsonb),
('2bf6d3b5-b44d-4649-be81-8d6024e1a378', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 3500.50, 'PENDING', '[{"product": "Headphone Fantech WHG05", "qty": 2, "price": 1750.25}]'::jsonb),
('1f4d90c2-a0ca-45a7-a95c-bd2feb5243e5', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 990.00, 'COMPLETED', '[{"product": "Iphone 15", "qty": 1, "price": 990.00}]'::jsonb),
('31c286a7-cf22-4dc4-841a-2b0265236289', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 12000.00, 'SHIPPED', '[{"product": "Macbook M1", "qty": 1, "price": 12000.00}]'::jsonb),
('08b5694d-58f7-4996-8bb4-83da0b4aa209', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 450.00, 'CANCELLED', '[{"product": "Intel Core i5 gen12400F", "qty": 1, "price": 450.00}]'::jsonb);

-- 4. Audit Logs (5 Rows)
INSERT INTO audit_logs (id, purchase_id, customer_id, type, previous_amount, new_amount) VALUES
('b37910f9-07d4-4605-a12c-2dad27253422', '1d4939cc-89e1-400b-967e-9f6a55ff0319', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'CREATE', 0.00, 1500.00),
('faee8cef-bd62-472f-aada-74c191a106de', '2bf6d3b5-b44d-4649-be81-8d6024e1a378', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'CREATE', 0.00, 3500.50),
('db18425f-b93f-46bf-8cda-9fab886fbdb6', '1f4d90c2-a0ca-45a7-a95c-bd2feb5243e5', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'CREATE', 0.00, 990.00),
('dfa79277-4a58-472f-b115-158431f137a0', '31c286a7-cf22-4dc4-841a-2b0265236289', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'CREATE', 0.00, 12000.00),
('39c10811-c11b-4077-8fac-bc015d5ca414', '08b5694d-58f7-4996-8bb4-83da0b4aa209', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'UPDATE', 500.00, 450.00);