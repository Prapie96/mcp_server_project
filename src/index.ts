import 'dotenv/config'
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { registerTools } from "./tools/tool.js";

import { initEmbeddingModel } from "./services/embedding.service.js";
import { seedAuditLogsWithHash } from "./utils/seedAudit.js";
import { registerPrompt } from "./tools/prompt.js";
import { seedInteractionEmbedding } from "./utils/seedInteraction.js";
import express from "express";
import type{ Request,Response,NextFunction } from "express";
import { authMiddleware } from './middleware/auth.js';
import { authContext } from './context/request.context.js';

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

registerPrompt();
registerTools();
// async function main() {
//   // await seedInteractionEmbedding();
//   // await seedAuditLogsWithHash();
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
//   console.error("Customer MCP Server running on stdio");
// }

// main().catch((error) => {
//   console.error("Fatal error in main():", error);
//   process.exit(1);
// });

app.post('/mcp',authMiddleware,async(req:Request,res:Response)=>{
  const user = req.user;
  const transportHTTP = new StreamableHTTPServerTransport({sessionIdGenerator:undefined});
  try {
    await server.connect(transportHTTP);
    await authContext.run(user,async()=>{
      await transportHTTP.handleRequest(req,res,req.body);
    })
    

  } catch (error) {
    
  }finally{
    req.on('close',()=>{
      transportHTTP.close().catch(()=>{});
      server.close().catch(()=>{});
    })
  }
})

app.get("/user",authMiddleware,async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const user = req.user;
    if(!user){
      res.status(404).json("Not Found User Data");
      return;
    }
    res.status(200).json(user);
  } catch (error) {
     res.status(500).json("Internal Server Error");
  }
})

app.listen(PORT,async()=>{
  console.log(`MCP Server is Running on ${PORT}`)
})