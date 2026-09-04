import { PoolClient } from "pg";
import { authContext } from "../context/request.context.js";
import { transactionWrapper } from "../helper/helper.js";
import { server } from "../index.js";
import z from "zod";
import { Customer } from "../model/customer.js";

export const registerToolTenant = () => {
  server.registerTool(
    "",
    {
      title: "search_customer_info_with_tenant",
      description:
        "search about customer information with tenantId if user has jwt token ",
      inputSchema: z.object({
        keyword: z
          .string()
          .describe(
            "id_first_name,last_name, email, or phone number to search for",
          ),
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
        const user = authContext.getStore();
        if (!user || user.role !== "Admin") {
          return {
            content: [
              {
                type: "text",
                text: "Permission Denied: เฉพาะ Admin เท่านั้นที่ใช้งานเครื่องมือนี้ได้",
              },
            ],
          };
        }
        const query = `
          SELECT 
          id,
          email,
          first_name,
          last_name,
          phone,
          created_at
          FROM customers
          WHERE
          email ILIKE $1 OR
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          phone ILIKE $1 
          LIMIT $2
          `;
        // const exercuteSQL = await
        const customer = await transactionWrapper(
          user.tenantId,
          async (client: PoolClient) => {
            const result = await client.query<Customer>(query, [
              keyword,
              limit,
            ]);
            return result.rows;
          },
        );

        return {
          content: [{ type: "text", text: JSON.stringify(customer, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: "เกิดข้อผิดพลาดในการค้นหาข้อมูลลูกค้า" },
          ],
        };
      }
    },
  );
  server.registerTool(
    "search_purchase_tenant",
    {
      description: "search purchase history from customer_id",
      inputSchema: z.object({
        customer_id: z.string(),
        keyword: z
          .string()
          .describe(
            "id_first_name,last_name, email, or phone number to search for",
          ),
        limit: z
          .number()
          .positive()
          .min(1)
          .max(10)
          .default(5)
          .describe("Number of results to return"),
      }),
    },
    async ({customer_id,keyword,limit}) => {
      try {
         const sql = `SELECT 
        id,
        customer_id,
        total_amount,
        status,
        order_item,
        order_item,
        created_at
        FROM purchase p1
        WHERE customer_id = $1
        email ILIKE $1 OR
          first_name ILIKE $1 OR
          last_name ILIKE $1 OR
          phone ILIKE $1
        AND NOT EXISTS (
          SELECT 1 FROM purchase p2
          WHERE p2.previous_purchase_id = p1.id
        )
        LIMIT = $1;
        `;

        return { content: [{ type: "text", text: "" }] };
      } catch (error) {
        return { content: [{ type: "text", text: "" }] };
      }
    },
  );
};
