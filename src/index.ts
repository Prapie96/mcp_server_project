import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

import { registerTools } from "./tools/tool.js";

import { initEmbeddingModel } from "./services/embedding.service.js";
import { seedAuditLogsWithHash } from "./utils/seedAudit.js";
import { registerPrompt } from "./tools/prompt.js";
import { seedInteractionEmbedding } from "./utils/seedInteraction.js";
import express from "express";
import type { Request, Response, NextFunction } from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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
await seedAuditLogsWithHash();
await seedInteractionEmbedding();
registerPrompt();
registerTools();

app.post("/mcp", async (req: Request, res: Response) => {
  const transportHTTP = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  try {
    await server.connect(transportHTTP);
    await transportHTTP.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "MCP request failed",
      });
    }
  } finally {
    req.on("close", () => {
      transportHTTP.close().catch(() => {});
      server.close().catch(() => {});
    });
  }
});

app.listen(PORT, async () => {
  console.log(`MCP Server is Running on ${PORT}`);
});
