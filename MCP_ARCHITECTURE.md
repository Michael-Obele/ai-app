# MCP Architecture

This document explains the Model Context Protocol (MCP) architecture in this project.

## Overview

This project exposes an **MCP Server** that makes shadcn-svelte documentation and tools available to AI code editors and other MCP clients.

**What this project does:**

- Provides three powerful tools for shadcn-svelte component discovery and documentation
- Exposes these tools via the Model Context Protocol
- Deployed at `https://shadcn-svelte.mastra.cloud` for public consumption

**What this project does NOT do:**

- Consume tools from external MCP servers (no MCP Client)
- Connect to other MCP services

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  shadcn-svelte-mcp Project                  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Mastra Instance                        │ │
│  │                  (src/index.ts)                         │ │
│  │                                                         │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │          MCP Server (shadcn)                     │  │ │
│  │  │          src/mastra/mcp-server.ts                │  │ │
│  │  │                                                  │  │ │
│  │  │  Exposes Three Tools:                            │  │ │
│  │  │  - shadcnSvelteListTool                         │  │ │
│  │  │  - shadcnSvelteGetTool                          │  │ │
│  │  │  - shadcnSvelteUtilityTool                      │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ Exposes tools via
                           │ HTTP/SSE transports
                           ▼
        ┌──────────────────────────────────────────┐
        │     External MCP Clients consume         │
        │         shadcn-svelte tools              │
        │                                          │
        │  - Cursor                                │
        │  - Windsurf                              │
        │  - VS Code                               │
        │  - Zed                                   │
        │  - Claude Code                           │
        │  - OpenAI Codex                          │
        │  - Any MCP-compatible client             │
        └──────────────────────────────────────────┘
```

## Components

### 1. MCP Server (`src/mastra/mcp-server.ts`)

**Purpose**: Exposes shadcn-svelte documentation tools to external MCP clients.

**What it does**:

- Exposes three powerful tools for component discovery and documentation
- Serves them via HTTP and SSE protocol
- Available at `https://shadcn-svelte.mastra.cloud`
- Makes shadcn-svelte documentation accessible to ANY MCP client

**Example**:

```typescript
export const shadcn = new MCPServer({
  name: "Shadcn Svelte Docs",
  version: "1.0.0",
  tools: {
    shadcnSvelteListTool,
    shadcnSvelteGetTool,
    shadcnSvelteUtilityTool,
  },
});
```

**Exposed Tools**:

- `shadcnSvelteListTool` - List all available components and docs
- `shadcnSvelteGetTool` - Get detailed component documentation
- `shadcnSvelteUtilityTool` - Installation, theming, and migration help

**Used in**:

- `src/server.ts` (production at Mastra Cloud)
- `src/dev-server.ts` (local development)
- `src/index.ts` (stdio mode for local MCP clients)

## Installation in Code Editors

To use the shadcn-svelte MCP server in your code editor, see the [README.md](./README.md#installation-in-your-code-editor) for detailed instructions for:

- Cursor
- Windsurf
- Visual Studio Code
- Zed
- Claude Code CLI
- OpenAI Codex CLI

## Available Tools

Once connected, your AI assistant will have access to:

### 1. shadcnSvelteListTool

List all available shadcn-svelte components and documentation sections.

**Example usage**: "Show me all available shadcn-svelte components"

### 2. shadcnSvelteGetTool

Get detailed documentation for a specific component including installation instructions, usage examples, props, and API details.

**Example usage**: "How do I install and use the Button component?"

### 3. shadcnSvelteUtilityTool

Access installation guides, theming customization, CLI usage, and migration assistance.

**Example usage**: "How do I customize the theme for shadcn-svelte?"

## Architecture Notes

### This Project's Scope

This project is **purely an MCP Server**. It:

- ✅ Exposes shadcn-svelte tools to external clients
- ❌ Does NOT consume tools from other MCP servers
- ❌ Does NOT include an MCP Client

### When Would You Need an MCP Client?

You would add an MCP Client (`src/mastra/mcp-client.ts`) if you wanted to:

- Consume tools from external MCP servers (like mcp.mastra.ai)
- Use tools from multiple MCP servers in your agents
- Build a multi-tenant application with dynamic tool loading

**This project doesn't need an MCP Client** because it only provides tools, it doesn't consume them.

## Common Confusion

### "I see mcp*mastra*\* tools in my IDE but not in my server"

This is **expected behavior**:

1. **Your IDE** (VS Code, Cursor, etc.) may connect to external MCP servers automatically
2. **This project's server** only exposes shadcn-svelte tools (not Mastra's tools)
3. To use external tools in your agents, you would need to add an MCP Client

### "Tool not found" Error in Production UI

If you see "Tool not found" in the Mastra Cloud UI but tools work via the protocol:

- This is a **UI rendering issue**, not a server configuration problem
- The tools are correctly exposed and functional
- External clients can connect and use the tools successfully

See `MCP_TOOL_NOT_FOUND_FIX.md` for detailed troubleshooting.

## Testing

### Test Your MCP Server Locally

```bash
# Test tools via MCP protocol
npm run mcp:test

# Start development server
npm run mcp:dev
```

### Test in Code Editors

After configuring your editor (see README.md), ask your AI assistant:

- "List all shadcn-svelte components"
- "Show me how to use the Button component"
- "How do I customize shadcn-svelte themes?"

## Production Deployment

The MCP server is deployed at `https://shadcn-svelte.mastra.cloud` and can be accessed via:

**SSE Endpoint**:

```
https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse
```

**HTTP Endpoint**:

```
https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/mcp
```

External clients can connect using these endpoints. See the README for editor-specific configuration examples.

## Troubleshooting

### "Tool not found" in Mastra Cloud UI

**Problem**: You see "Tool not found" in the production UI at shadcn-svelte.mastra.cloud

**Solution**: This is a known UI rendering issue. The tools are correctly exposed and functional:

- Tools work when accessed via the MCP protocol
- External clients (Cursor, Windsurf, etc.) can connect and use the tools
- Agents can invoke the tools successfully

See `MCP_TOOL_NOT_FOUND_FIX.md` for detailed analysis.

### Tools not appearing in my editor

**Check**:

1. Is the MCP server URL configured correctly in your editor settings?
2. Have you restarted your editor after adding the configuration?
3. Is your editor's MCP feature enabled?
4. Check editor-specific troubleshooting in README.md

### Cannot connect to the MCP server

**Check**:

1. Is the server URL correct? (`https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse` or `.../mcp`)
2. Do you have internet connectivity?
3. Are there any firewall rules blocking outbound HTTPS?
4. Try both SSE and HTTP endpoints to see if one works

## Summary

This project provides a **production-ready MCP Server** that exposes shadcn-svelte documentation and tools to AI code editors. It does not consume tools from external servers (no MCP Client needed).

**Key Points**:

- ✅ Exposes 3 powerful tools for shadcn-svelte components
- ✅ Deployed at https://shadcn-svelte.mastra.cloud
- ✅ Supports HTTP and SSE transports
- ✅ Compatible with all major AI code editors
- ❌ Does NOT include MCP Client (not needed for this use case)

For installation instructions, see [README.md](./README.md#installation-in-your-code-editor).

## Related Files

- `src/mastra/mcp-server.ts` - MCP server definition (exposes shadcn-svelte tools)
- `src/index.ts` - Mastra instance with MCP server configuration
- `src/server.ts` - Production HTTP server
- `src/dev-server.ts` - Development HTTP/SSE server
- `src/mastra/tools/` - Tool implementations
- `.github/copilot-instructions.md` - Architecture documentation for AI assistants
- `README.md` - Installation and usage instructions
