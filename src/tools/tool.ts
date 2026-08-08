import z from "zod";
import {
  search_customer_info,
  searchFirstCustomer,
} from "../services/customer.service.js";
import { server } from "../index.js";
import { pool } from "../db/connection.js";
import {
  saveInteraction,
  searchInteraction,
} from "../services/interaction.service.js";

export const registerTools = () => {
  server.registerTool(
    "search_customer",
    {
      description: "search a first customer info",
      inputSchema: z.object({ keyword: z.string() }),
    },
    async (args: { keyword: string }) => {
      const { keyword } = args;
      console.error(`[MCP Tool] กำลังค้นหาข้อมูลลูกค้าจาก: ${keyword}`);
      const customer = await searchFirstCustomer(keyword);
      return {
        content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
      };
    },
  );
  server.registerTool(
    "search_customer_info",
    {
      description: "search about customer information",
      inputSchema: z.object({
        searchTerm: z.object({
          email: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          phone: z.string().max(10).optional(),
        }),
      }),
    },
    async ({ searchTerm }) => {
      // const { searchTerm } = args;
      try {
        console.error(
          `[MCP Tool] กำลังค้นหาข้อมูลลูกค้าจาก: ${JSON.stringify(searchTerm)}`,
        );
        const term = Object.values(searchTerm).find((v) => !!v) ?? "";

        const customer = await search_customer_info(term);
        return {
          content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
        };
      } catch (error) {
        console.error("Error during using search_customer_info", error);
        return { content: [{ type: "text", text: "[]" }] };
      }
    },
  );

  server.registerTool(
    "save_customer_interaction",
    {
      description:
        "save history interaction's customer into RAG (Vector Database) for searching Context in the future",
      inputSchema: z.object({
        customerId: z.string(),
        content: z.string(),
      }),
    },
    async ({ customerId, content }) => {
      try {
        console.error(`[MCP Tool] กำลังบันทึกข้อมูลลงRAG`);
        const save_interaction = await saveInteraction({ customerId, content });
        if (save_interaction.success) {
          return {
            content: [{ type: "text", text: "สำเร็จ" }],
          };
        }

        return {
          content: [{ type: "text", text: "ล้มเหลว" }],
        };
      } catch (error) {
        console.error("Error during using save_customer_interaction", error);
        return { content: [{ type: "text", text: "[]" }] };
      }
    },
  );

  server.registerTool(
    "search_history_interaction",
    {
      description:
        "search history about interaction with customer in RAG (Vector Database)",
      inputSchema: z.object({
        query: z.string(),
      }),
    },
    async ({ query }) => {
      try {
        console.error(
          `[MCP Tool] กำลังค้นหาข้อมูลประวัติที่คุยกับลูกค้าเกี่ยวกับ: ${JSON.stringify(query)}`,
        );
        const result = await searchInteraction(query);
        if (!result || result.length === 0) {
          return {
            content: [
              { type: "text", text: "ไม่พบประวัติการสนทนาที่เกี่ยวข้อง" },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Error during using search_customer_info", error);
        return { content: [{ type: "text", text: "[]" }] };
      }
    },
  );

  server.registerTool(
    "insert_customer_info",
    {
      description: "insert customer data into customer database",
      inputSchema: z.object({
        data: z.object({
          email: z.email(),
          firstName: z.string(),
          lastName: z.string(),
          phone: z.string(),
        }),
      }),
    },
    async ({ data }) => {
      const { email, firstName, lastName, phone } = data;
      try {
        console.error(
          `[MCP Tool] กำลังบันทึกข้อมูลลูกค้าเข้าระบบ: ${JSON.stringify(data)}`,
        );
        const result = await pool.query(
          `
        INSERT INTO customers(email,first_name,last_name,phone)
        VALUES ($1,$2,$3,$4)
        RETURNING id
        `,
          [email, firstName, lastName, phone],
        );

        return {
          content: [{ type: "text", text: JSON.stringify(result.rows[0].id) }],
        };
      } catch (error: unknown) {
        console.error("Error during using search_customer_info", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return {
          content: [
            { type: "text", text: JSON.stringify({ error: errorMessage }) },
          ],
        };
      }
    },
  );
};
