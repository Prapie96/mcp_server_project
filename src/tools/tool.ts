import z from "zod";
import {
  calculate_purchase,
  insert_customer_info,
  search_customer_info,
  search_purchase,
} from "../services/customer.service.js";
import { server } from "../index.js";
import { pool } from "../db/connection.js";
import {
  saveInteraction,
  searchInteraction,
} from "../services/interaction.service.js";

export const registerTools = () => {
  {
    /**Tool Search Customer from customer data  */
  }
  server.registerTool(
    "search_customer_info",
    {
      description: "search about customer information",
      inputSchema: z.object({
        keyword: z
          .string()
          .describe("The name, email, or phone number to search for"),
        limit: z
          .number()
          .positive()
          .min(1)
          .max(10)
          .default(5)
          .describe("Number of results to return"),
      }),
    },
    async ({ keyword, limit }) => {
      try {
        console.error(
          `[MCP Tool] กำลังค้นหาข้อมูลลูกค้าจาก: ${JSON.stringify(keyword)} จำนวน ${limit} คน`,
        );

        const customer = await search_customer_info(keyword, limit);
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
        content: z
          .string()
          .describe(
            "Detailed summary or text content of the interaction to store in vector database",
          ),
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
        query: z
          .string()
          .describe(
            "Search keywords or topic to retrieve interaction context from RAG",
          ),
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

        const result = await search_purchase(customer_id);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
        const result = await calculate_purchase(customerId);

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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

  server.registerTool(
    "get_audit_logs",
    {
      title: "Get Audit Logs",
      description:
        "ดึงข้อมูลประวัติจากตาราง audit_logs สามารถกรองตาม purchase_id, customer_id หรือ operation_type ได้",
      inputSchema: z.object({
        purchase_id: z.string().optional(),
        customer_id: z.string().optional(),
        operation_type: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
        limit: z.number().min(1).positive().default(10),
      }),
    },
    async ({ purchase_id, customer_id, operation_type, limit }) => {
      try {
        let query =
          "SELECT id, purchase_id, customer_id, operation_type,previous_amount,new_amount,amount_delta,reason,action_by, created_at FROM audit_logs WHERE 1=1";
        const params: any[] = [];
        let paramIndex = 1;

        if (purchase_id) {
          query += ` AND purchase_id = $${paramIndex++}`;
          params.push(purchase_id);
        }
        if (customer_id) {
          query += ` AND customer_id = $${paramIndex++}`;
          params.push(customer_id);
        }
        if (operation_type) {
          query += ` AND operation_type = $${paramIndex++}`;
          params.push(operation_type);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
        params.push(limit);

        const result = await pool.query(query, params);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result.rows, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching audit logs: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
};
