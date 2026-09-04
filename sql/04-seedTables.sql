SET search_path TO seven_eleven, public;

INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('1100bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'สมศักดิ์', 'เซเว่น', 'somchai.7@example.com', '0811111111'),
('1100bc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'วิชัย', 'รักสะอาด', 'wichai.7@example.com', '0811111122'),
('1100bc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'กฤษณา', 'มั่งมี', 'kritsana.7@example.com', '0811111133');

INSERT INTO purchase (id, customer_id, total_amount, status, order_item) VALUES
('110039cc-89e1-400b-967e-9f6a55ff0311', '1100bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 150.00, 'COMPLETED', '[{"product": "ข้าวกล่อง 7-11", "qty": 3, "price": 45.00}, {"product": "น้ำอัดลม", "qty": 1, "price": 15.00}]'::jsonb),
('110039cc-89e1-400b-967e-9f6a55ff0322', '1100bc99-9c0b-4ef8-bb6d-6bb9bd380a22', 89.00, 'PENDING', '[{"product": "ขนมจีบหมู", "qty": 2, "price": 44.50}]'::jsonb);

INSERT INTO interactions (customer_id, interaction_type, content, embedding) VALUES
('1100bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SUPPORT_CHAT', 'สอบถามเรื่องโปรโมชั่นแสตมป์เซเว่น', ARRAY_FILL(0.1::REAL, ARRAY[384]));

SET search_path TO lotus, public;

INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('2200bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'สมศรี', 'โลตัส', 'somsri.l@example.com', '0822222211'),
('2200bc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'จอห์น', 'สมญัติ', 'john.l@example.com', '0822222222'),
('2200bc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'มานิตา', 'ใจดี', 'manita.l@example.com', '0822222233');

INSERT INTO purchase (id, customer_id, total_amount, status, order_item) VALUES
('220039cc-89e1-400b-967e-9f6a55ff0311', '2200bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1250.00, 'COMPLETED', '[{"product": "น้ำมันพืช 1L", "qty": 2, "price": 65.00}, {"product": "ข้าวหอมมะลิ 5กก.", "qty": 1, "price": 1120.00}]'::jsonb),
('220039cc-89e1-400b-967e-9f6a55ff0322', '2200bc99-9c0b-4ef8-bb6d-6bb9bd380a22', 450.00, 'COMPLETED', '[{"product": "กระดาษทิชชู", "qty": 3, "price": 150.00}]'::jsonb);

INSERT INTO interactions (customer_id, interaction_type, content, embedding) VALUES
('2200bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SUPPORT_CHAT', 'สอบถามเงื่อนไขการสะสมแต้มคลับการ์ด', ARRAY_FILL(0.2::REAL, ARRAY[384]));


SET search_path TO cj_more, public;

INSERT INTO customers (id, first_name, last_name, email, phone) VALUES
('3300bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'มานพ', 'ซีเจ', 'manop.cj@example.com', '0833333311'),
('3300bc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'สุดา', 'แสงจันทร์', 'suda.cj@example.com', '0833333322');

INSERT INTO purchase (id, customer_id, total_amount, status, order_item) VALUES
('330039cc-89e1-400b-967e-9f6a55ff0311', '3300bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 320.00, 'COMPLETED', '[{"product": "นมถั่วเหลือง", "qty": 4, "price": 40.00}, {"product": "บะหมี่กึ่งสำเร็จรูปแพ็ค", "qty": 2, "price": 80.00}]'::jsonb);

INSERT INTO interactions (customer_id, interaction_type, content, embedding) VALUES
('3300bc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'SUPPORT_CHAT', 'สอบถามพิกัดสาขา CJ More ใกล้บ้าน', ARRAY_FILL(0.3::REAL, ARRAY[384]));