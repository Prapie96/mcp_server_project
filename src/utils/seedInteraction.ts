import { seedPool } from "../db/connection.js";
import { createEmbedding } from "../services/embedding.service.js";
import pgvector from "pgvector";
export async function seedInteractionEmbedding() {
  try {
    const checkSeedExist = await seedPool.query(
      `SELECT COUNT(*) FROM audit_logs`,
    );
    if (checkSeedExist.rows[0].count > 0) {
      console.error("Already interactions data skip seeding");
      return;
    }

    const mockInteractions = [
      {
        customer_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        type: "SUPPORT_CHAT",
        content:
          "สอบถามเรื่องการรับประกันสินค้า Mouse Logitech G304 เสียเคลมอย่างไรครับ",
      },
      {
        customer_id: "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        type: "SUPPORT_CHAT",
        content: "ต้องการยกเลิกคำสั่งซื้อและขอเงินคืนเนื่องจากส่งสินค้าล่าช้า",
      },
      {
        customer_id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        type: "SUPPORT_CHAT",
        content:
          "Iphone 15 ที่สั่งไปมีรอยขีดข่วนที่ตัวเครื่อง สามารถเปลี่ยนเครื่องใหม่ได้ไหม",
      },
      {
        customer_id: "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
        type: "SUPPORT_CHAT",
        content:
          "สอบถามสเปคของ Macbook M1 เพิ่มเติมเรื่องแรมและการใช้งานกราฟิก",
      },
      {
        customer_id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
        type: "SUPPORT_CHAT",
        content: "สถานะการจัดส่ง Intel Core i5 ตอนนี้ถึงไหนแล้วครับ รอนานมาก",
      },
    ];
    for (const item of mockInteractions) {
      const embedding = await createEmbedding(item.content);
      await seedPool.query(
        `INSERT INTO interactions (customer_id, interaction_type, content, embedding) 
         VALUES ($1, $2, $3, $4::vector)`,
        [item.customer_id, item.type, item.content, pgvector.toSql(embedding)],
      );
    }
    console.error("Seed interactions Success");
  } catch (error) {
    console.error("Error seeding interactions:", error);
  }
}
