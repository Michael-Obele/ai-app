import { shadcnSvelteMCPServer } from "./mastra/mcp-server.js";

// Start the MCP server in stdio mode for testing
await shadcnSvelteMCPServer.startStdio();
