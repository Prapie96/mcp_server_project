import { server } from "../index.js";
import { email, z } from "zod";

export const registerPrompt = () => {
  server.registerPrompt(
    "summary_customer_overview",
    {
      description:
        "Analysis customer data Hybrid total_amount(SQL) and interaction history(Vector Search)",
      argsSchema: z.object({
        customer_id: z
          .string()
          .optional()
          .describe("id reference's customer to search"),
        email: z.email().optional().describe("email's customer to search"),
      }),
    },
    ({ customer_id, email }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `คุณคือผู้เชี่ยวชาญด้าน Customer Success จงวิเคราะห์ข้อมูลของลูกค้า ID: "${customer_id}" หรือ email ของลูกค้า email: "${email}"  ตามขั้นตอนเชิงโครงสร้างดังนี้:
                  1. เรียกใช้ Tool สรุปยอดซื้อเพื่อคำนวณยอดใช้จ่ายรวม  และความถี่ในการทำธุรกรรมผ่าน SQL Aggregation
                  2. เรียกใช้ Tool ค้นหาข้อความแบบใกล้เคียง (Semantic Search via pgvector) บน Interaction History เพื่อตรวจสอบว่าลูกค้าเคยบ่นหรือเจอปัญหาอะไรล่าสุด
                  3. สรุปข้อมูลออกมาเป็น 3 หัวข้อหลัก: [สถานะทางด้านการเงิน], [อารมณ์และระดับความพึงพอใจล่าสุด], และ [ข้อเสนอแนะเชิงรุกในการดูแลลูกค้า]
                  `,
            },
          },
        ],
      };
    },
  );
};
