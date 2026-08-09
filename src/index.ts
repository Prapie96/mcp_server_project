import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { registerTools } from "./tools/tool.js";
import { pool } from "./db/connection.js";
import { initEmbeddingModel } from "./services/embedding.service.js";
import { seedAuditLogsWithHash } from "./utils/seedAudit.js";
import { registerResource } from "./tools/resource.js";
export const server = new McpServer(
  {
    name: "mcp-info-customer",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);
await initEmbeddingModel();
// registerResource();
registerTools();
async function main() {
  await seedAuditLogsWithHash();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Customer MCP Server running on stdio");
}
// async function testDB() {
//   const test = await pool.query("SELECT * FROM customers");
//   return console.log(test.rows);
// }
// testDB();

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
