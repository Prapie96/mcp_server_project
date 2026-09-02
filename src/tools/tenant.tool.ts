import { authContext } from "../context/request.context.js";
import { transactionWrapper } from "../helper/helper.js";
import { server } from "../index.js";
import z from "zod";

export const registerToolTenant = () => {
  server.registerTool(
    "",
    {
      title: "search_customer_info",
      description: "search about customer information",
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
        // const customer = transactionWrapper(user.tenantId);
        return { content: [{ type: "text", text: "" }] };
      } catch (error) {
        return { content: [{ type: "text", text: "" }] };
      }
    },
  );
};
