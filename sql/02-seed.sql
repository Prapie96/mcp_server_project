
INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'สมชาย', 'ใจดี', 'somchai.j@example.com', '0812345678'),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sudacha', 'Srisura', 'suda.s@example.com', '0823456789'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'ณเดชน์', 'คูกิมิยะ', 'nadech.k@example.com', '0834567890'),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Jerminka', 'Jermin', 'jerminka.min@example.com', '0845678901'),
('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'ประทีป', 'อรรถลักษณ์', 'prateep.a@example.com', '0856789012');


INSERT INTO purchase (id, customer_id, total_amount, status, order_item) VALUES
('1d4939cc-89e1-400b-967e-9f6a55ff0319', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3600.00, 'COMPLETED', '[{"product": "Mouse Logitech G304", "qty": 3, "price": 1200.00}]'::jsonb),
('2bf6d3b5-b44d-4649-be81-8d6024e1a378', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 1980.00, 'PENDING', '[{"product": "Headphone Fantech WHG05", "qty": 2, "price": 990.00}]'::jsonb),
('1f4d90c2-a0ca-45a7-a95c-bd2feb5243e5', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 23000.00, 'COMPLETED', '[{"product": "Iphone 15", "qty": 1, "price": 990.00}]'::jsonb),
('31c286a7-cf22-4dc4-841a-2b0265236289', 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 12000.00, 'COMPLETED', '[{"product": "Macbook M1", "qty": 1, "price": 12000.00}]'::jsonb),
('08b5694d-58f7-4996-8bb4-83da0b4aa209', 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 4500.00, 'PENDING', '[{"product": "Intel Core i5 gen12400F", "qty": 2, "price": 2250.00}]'::jsonb);

