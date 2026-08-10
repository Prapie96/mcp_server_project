import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";

import { registerTools } from "./tools/tool.js";

import { initEmbeddingModel } from "./services/embedding.service.js";
import { seedAuditLogsWithHash } from "./utils/seedAudit.js";
import { registerPrompt } from "./tools/prompt.js";
import { seedInteractionEmbedding } from "./utils/seedInteraction.js";

export const server = new McpServer(
  {
    name: "mcp-info-customer",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {},
    },
  },
);
await initEmbeddingModel();

registerPrompt();
registerTools();
async function main() {
  await seedInteractionEmbedding();
  await seedAuditLogsWithHash();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Customer MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
