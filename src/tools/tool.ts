import z from "zod";
import {
  insert_customer_info,
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
  {
    /**Tool Search Customer from customer data  */
  }
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
  {
    /**Tool Insert Interaction */
  }
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
  {
    /**Tool Search Interaction  */
  }
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
        console.error("Error during using search_history_interaction", error);
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

  {
    /**Tool search purchase customer  */
  }
  server.registerTool(
    "search_customer_purchase",
    {
      description: "search purchase history from customer_id",
      inputSchema: z.object({
        customer_id: z.string(),
      }),
    },
    async ({ customer_id }) => {
      try {
        console.error(
          `[MCP Tool] กำลังค้นหาข้อมูลประวัติการซื้อของลูกค้า: ${JSON.stringify(customer_id)}`,
        );
        const sql = `SELECT 
        id,
        customer_id,
        total_amount,
        status,
        order_item,
        order_item,
        created_at
        FROM purchase
        WHERE customer_id = $1
        `;
        const result = await pool.query(sql, [customer_id]);
        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      } catch (error) {
        console.error("Error during using search_customer_purchase", error);
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
  {
    /**Tool Calculate order item  */
  }
  server.registerTool(
    "calculate_customer_purchase",
    {
      description:
        "Calculate total spending, purchase count, and average order value for a specific customer ID using SQL aggregation",
      inputSchema: z.object({
        customerId: z.string(),
      }),
    },
    async ({ customerId }) => {
      try {
        const sql = `
          SELECT
            c.id,
            c.first_name || ' ' || c.last_name AS customer_name,
            COUNT(p.id) as total_orders,
            COALESCE(SUM(p.total_amount),0.00) AS all_purchase_total,
            COALESCE(AVG(p.total_amount),0.00) AS average_purchase_amount
          FROM customers c
          LEFT JOIN purchase p 
          ON p.customer_id = c.id
          WHERE c.id = $1
          GROUP BY c.id ,c.first_name , c.last_name;
        
        `;
        const result = await pool.query(sql, [customerId]);

        return {
          content: [
            { type: "text", text: JSON.stringify(result.rows, null, 2) },
          ],
        };
      } catch (error) {
        console.error("Error during using calculate_customer_purchase", error);
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

  {
    /**Tool Test Insert  */
  }
  server.registerTool(
    "insert_customer_info",
    {
      description: "insert customer data into customer database",
      inputSchema: z.object({
        data: z.object({
          email: z.email(),
          first_name: z.string(),
          last_name: z.string(),
          phone: z.string(),
        }),
      }),
    },
    async ({ data }) => {
      const { email, first_name, last_name, phone } = data;
      try {
        console.error(
          `[MCP Tool] กำลังบันทึกข้อมูลลูกค้าเข้าระบบ: ${JSON.stringify(data)}`,
        );
        const result = await insert_customer_info({
          email,
          first_name,
          last_name,
          phone,
        });

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
