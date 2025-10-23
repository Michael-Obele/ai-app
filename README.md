# shadcn-svelte-mcp

**Version 1.0.0** - Production-ready MCP server for shadcn-svelte components

Mastra MCP server and tooling for the shadcn-svelte component docs and developer utilities. Now deployed and available at [https://shadcn-svelte.mastra.cloud](https://shadcn-svelte.mastra.cloud)!

This repository contains a Mastra-based MCP server, docs registry and tools that work with the shadcn-svelte component documentation. Use it in your AI-powered code editor to get instant access to shadcn-svelte component information.

## 🎉 What's New in v1.0.0

- ✅ Production deployment on Mastra Cloud
- ✅ Three powerful MCP tools for component discovery and documentation
- ✅ Support for all major AI code editors (Cursor, Windsurf, VS Code, Zed, Claude Code, Codex)
- ✅ HTTP and SSE transport protocols
- ✅ Comprehensive component registry with 59+ components

## Installation in Your Code Editor

Add the **Shadcn Svelte Docs** MCP server to your AI code editor to get instant access to shadcn-svelte component documentation and utilities.

### Cursor

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "MCP" or "Model Context Protocol"
3. Add a new server configuration:

```json
{
  "shadcn-svelte": {
    "type": "sse",
    "url": "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse"
  }
}
```

Or use the HTTP endpoint:

```json
{
  "shadcn-svelte": {
    "type": "http",
    "url": "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/mcp"
  }
}
```

### Windsurf

1. Open `~/.codeium/windsurf/mcp_config.json` in your editor
2. Add the following configuration:

```json
{
  "mcpServers": {
    "shadcn-svelte": {
      "url": "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse",
      "transport": "sse"
    }
  }
}
```

3. Save and restart Windsurf

### Visual Studio Code

1. Create or edit `.vscode/mcp.json` in your workspace root
2. Add the server configuration:

```json
{
  "servers": {
    "shadcn-svelte": {
      "type": "sse",
      "url": "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse"
    }
  }
}
```

3. Open VSCode settings and enable "Chat > MCP"
4. In Agent mode, open `mcp.json` and click "start"

Tip: You can also add MCP servers from the Command Palette in VS Code — press Ctrl+Shift+P (or Cmd+Shift+P on macOS), run "MCP: Add server" (or "mcp add server"), then choose:

- "Command (stdio)" to run a local command that implements the MCP protocol (e.g., an `npx` command starting a stdio MCP server)
- "HTTP (HTTP or Server-Sent Events)" to connect directly to a remote HTTP/SSE MCP endpoint (paste the `https://.../mcp` or `.../sse` URL)

This Command Palette flow is the quickest way to add a server without editing files manually.

### Zed

Zed uses a `settings.json` file for MCP server configuration:

1. Open Zed settings (Cmd/Ctrl + ,)
2. Navigate to the JSON settings file (usually `~/.config/zed/settings.json`)
3. Add the MCP server configuration under `context_servers`:

```json
{
  "context_servers": {
    "shadcn-svelte": {
      "source": "custom",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse"
      ],
      "env": {}
    }
  }
}
```

Alternatively, for HTTP transport:

```json
{
  "context_servers": {
    "shadcn-svelte": {
      "source": "custom",
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/mcp"
      ],
      "env": {}
    }
  }
}
```

4. Save the file and restart Zed
5. Open the Agent Panel to verify the server is connected (look for a green indicator)
   Note: Zed also exposes a UI form for adding MCP/context servers which is often easier than editing `settings.json` manually — open Zed's Agent/AI settings and use the "Add server" form to paste the HTTP/SSE URL or configure a local command.

### Claude Code CLI

Install using the terminal:

```bash
claude mcp add shadcn-svelte --url https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse
```

### OpenAI Codex CLI

Register from the terminal:

```bash
codex mcp add shadcn-svelte --url https://shadcn-svelte.mastra.cloud/api/mcp/shadcn/sse
```

Then run `codex mcp list` to confirm it's enabled.

## Available Tools

Once installed, your AI assistant will have access to these tools:

1. **shadcnSvelteListTool** - List all available shadcn-svelte components and documentation sections
2. **shadcnSvelteGetTool** - Get detailed documentation for a specific component (installation, usage, props, examples)
3. **shadcnSvelteUtilityTool** - Access installation guides, theming help, CLI usage, and migration assistance

## Example Usage

After installing the MCP server in your editor, you can ask your AI assistant:

- "Show me how to install the shadcn-svelte button component"
- "List all available shadcn-svelte components"
- "How do I customize the theme for shadcn-svelte?"
- "What are the props for the Dialog component?"
- "Help me migrate from shadcn-svelte v0.x to v1.x"

## Local Development

Want to run the MCP server locally or contribute to the project?

### Contents

- `src/` - Mastra bootstrap, MCP servers, tools, agents and docs content.
- `src/mastra/docs/` - Documentation content and registry for shadcn-svelte components.
- `src/mastra/tools/` - Tools that expose component discovery, fetching and utilities.
- `package.json` - npm scripts and dependencies.

### Quick start (development smoke-test)

1. Install dependencies (using your preferred package manager).

```bash
# npm
npm install

# or bun
bun install

# or pnpm
pnpm install
```

2. Run the development smoke-test (recommended):

```bash
# Starts Mastra in dev mode; this repo's smoke-test expects a short run to detect runtime errors
npm run dev
```

3. Run MCP server locally (stdio):

```bash
npm run mcp:stdio
```

Or start the dev HTTP server:

```bash
npm run mcp:dev
```

## Useful scripts

- `npm run dev` - Start Mastra in development mode (recommended smoke-test).
- `npm run build` - Build the Mastra project for production.
- `npm run start` - Start the built Mastra server.
- `npm run mcp:stdio` - Run the MCP server in stdio mode (runs `npx tsx src/index.ts`).
- `npm run mcp:dev` - Run the MCP dev server (runs `npx tsx src/dev-server.ts`).
- `npm run test:firecrawl` - Run the Firecrawl test harness (`npx tsx src/test-firecrawl.ts`).
- `npm run test:simple` - Run the simple tools test (`npx tsx src/test-tools-simple.ts`).
- `npm test` - Placeholder test script (prints an error message by default).

## MCP Architecture

This project exposes a **production-ready MCP Server** that makes shadcn-svelte documentation and tools available to AI code editors.

**What this means:**

- **MCP Server** (`src/mastra/mcp-server.ts`) - Exposes three shadcn-svelte tools to external MCP clients (Cursor, Windsurf, VS Code, etc.)
- **No MCP Client needed** - This project only _provides_ tools, it doesn't consume tools from other servers

The server is deployed at `https://shadcn-svelte.mastra.cloud` and exposes tools via HTTP and SSE transports.

For a detailed explanation of MCP concepts, see `MCP_ARCHITECTURE.md`.

## Conventions & notes

- The project uses Svelte 5 runes in documentation examples and the component tooling expects Svelte 5 syntax (`$state()`, `$props()`, `$derived()`, `$effect()` etc.). See `src/mastra/docs` for examples and a migration guide.
- Tools are implemented under `src/mastra/tools` and should use `zod` for input validation.
- The docs registry is `src/mastra/docs/registry.json` — add component entries there when adding docs.

## Development tips

- Node >= 20.9.0 is recommended (see `package.json` engines).
- When adding tools, follow the patterns in `src/mastra/tools/shadcn-svelte-get.ts` and `shadcn-svelte-list.ts`.
- After making changes, run the 10–15s smoke-test via `npm run dev` to surface runtime integration issues early.

## License

This project inherits the repository license. Check `package.json` for license details.

---

For more details:

- **MCP Architecture**: See `MCP_ARCHITECTURE.md` for detailed explanation of MCP server vs client
- **Internal tooling and docs**: See `src/mastra/docs/README.md`
- **AI assistant guide**: See `.github/copilot-instructions.md`
