# MCP Tool Not Found - Root Cause and Solution

## Problem

You were seeing Mastra MCP tools (like `mcp_mastra_clearMastraCourseHistory`) in your IDE but getting "tool not found" errors in production.

## Root Cause

**Confusion between MCP Server and MCP Client**

Your project has two MCP components that serve different purposes:

1. **MCP Server** (`src/mastra/mcp-server.ts`)
   - **Purpose**: Exposes YOUR tools to external MCP clients
   - **Tools exposed**: `shadcnSvelteListTool`, `shadcnSvelteGetTool`, `shadcnSvelteUtilityTool`
   - **Who can use it**: External MCP clients (Claude Desktop, Cursor, etc.)

2. **MCP Client** (`src/mastra/mcp-client.ts`) - **THIS WAS MISSING**
   - **Purpose**: Connects to EXTERNAL MCP servers to use THEIR tools
   - **Tools available**: `mcp_mastra_*` tools from mcp.mastra.ai
   - **Who can use it**: YOUR agents in this project

The Mastra MCP tools you were seeing in your IDE come from **Mastra's official MCP server** (mcp.mastra.ai), not from your own server. Your IDE was connecting to that external server automatically, but your production code wasn't.

## Solution

We added the missing **MCP Client** configuration:

### 1. Created MCP Client (`src/mastra/mcp-client.ts`)

```typescript
import { MCPClient } from "@mastra/mcp";

export const mastraMCPClient = new MCPClient({
  servers: {
    mastra: {
      url: new URL("https://mcp.mastra.ai"),
    },
  },
});
```

This connects to Mastra's official MCP server and makes their tools available to your agents.

### 2. Example Agent Using External MCP Tools

Created `src/mastra/agents/example-mcp-agent.ts` to demonstrate usage:

```typescript
import { Agent } from "@mastra/core/agent";
import { mastraMCPClient } from "../mcp-client";

export const exampleMCPAgent = new Agent({
  name: "Example MCP Agent",
  instructions: `...`,
  model: "openai/gpt-4o-mini",
  tools: await mastraMCPClient.getTools(), // ← Gets tools from mcp.mastra.ai
});
```

### 3. Test Script

Created `src/test-mcp-client.ts` to verify the connection:

```bash
npm run mcp:test-client
```

This script:

- Connects to mcp.mastra.ai
- Lists all available tools
- Tests a sample tool call
- Demonstrates that the connection works

## Architecture Diagram

```
Your Application
├── MCP Server (src/mastra/mcp-server.ts)
│   └── Exposes YOUR tools (shadcn-svelte-*)
│       └── Used by: External MCP clients
│
└── MCP Client (src/mastra/mcp-client.ts)
    └── Connects to EXTERNAL servers (mcp.mastra.ai)
        └── Provides: mcp_mastra_* tools
            └── Used by: YOUR agents
```

## Files Changed

1. **Created**:
   - `src/mastra/mcp-client.ts` - MCP client configuration
   - `src/mastra/agents/example-mcp-agent.ts` - Example agent using external tools
   - `src/test-mcp-client.ts` - Test script for MCP client
   - `MCP_ARCHITECTURE.md` - Comprehensive architecture documentation
   - `MCP_TOOL_NOT_FOUND_FIX.md` - This document

2. **Updated**:
   - `README.md` - Added MCP architecture section
   - `.github/copilot-instructions.md` - Clarified MCP server vs client
   - `package.json` - Added `mcp:test-client` script

## How to Use External MCP Tools

### In Your Agents

```typescript
import { mastraMCPClient } from "../mcp-client";

export const myAgent = new Agent({
  // ... other config
  tools: await mastraMCPClient.getTools(),
});
```

### Available Tools from mcp.mastra.ai

- `mcp_mastra_mastraDocs` - Access Mastra documentation
- `mcp_mastra_mastraExamples` - Get code examples
- `mcp_mastra_mastraChanges` - Check changelogs
- `mcp_mastra_mastraBlog` - Read blog posts
- `mcp_mastra_startMastraCourse` - Start the Mastra course
- `mcp_mastra_getMastraCourseStatus` - Get course status
- `mcp_mastra_nextMastraCourseStep` - Continue course
- `mcp_mastra_clearMastraCourseHistory` - Reset course progress
- And more...

## Testing

### Test External MCP Client Connection

```bash
npm run mcp:test-client
```

### Test Your MCP Server

```bash
npm run mcp:test
```

### Run Full Smoke Test

```bash
npm run dev
```

## Key Takeaways

1. **MCP Server** = Share YOUR tools with others
2. **MCP Client** = Use OTHER PEOPLE'S tools in your app
3. The tools you saw in your IDE (`mcp_mastra_*`) were from an external server
4. To use those tools in your app, you need an MCP Client, not an MCP Server
5. MCP Clients are used directly in agents, not registered in the Mastra instance

## Next Steps

1. Test the connection: `npm run mcp:test-client`
2. Review the architecture: Read `MCP_ARCHITECTURE.md`
3. Try the example agent: See `src/mastra/agents/example-mcp-agent.ts`
4. Add more external MCP servers to `src/mastra/mcp-client.ts` as needed

## Additional Resources

- MCP Architecture: `MCP_ARCHITECTURE.md`
- Mastra MCP Docs: Check the tools output for documentation links
- Model Context Protocol: https://modelcontextprotocol.io/
