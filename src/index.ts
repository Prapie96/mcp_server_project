import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { registerTools } from "./tools/tool.js";
import { pool } from "./db/connection.js";
import { initEmbeddingModel } from "./services/embedding.service.js";

export const server = new McpServer({
  name: "mcp-info-customer",
  version: "1.0.0",
});
await initEmbeddingModel();
registerTools();
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
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
