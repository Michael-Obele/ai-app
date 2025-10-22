# shadcn-svelte-mcp

Mastra MCP server and tooling for the shadcn-svelte component docs and developer utilities.

This repository contains a Mastra-based MCP server, docs registry and tools that work with the shadcn-svelte component documentation. It is designed for local development using Node (recommended Node >= 20.9.0) and the `mastra` developer tooling.

## Contents

- `src/` - Mastra bootstrap, MCP servers, tools, agents and docs content.
- `src/mastra/docs/` - Documentation content and registry for shadcn-svelte components.
- `src/mastra/tools/` - Tools that expose component discovery, fetching and utilities.
- `package.json` - npm scripts and dependencies.

## Quick start (development smoke-test)

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

- `npm run dev` - Start Mastra dev (recommended smoke-test).
- `npm run build` - Build for production.
- `npm run start` - Start built server.
- `npm run mcp:stdio` - Run the MCP server in stdio mode.
- `npm run mcp:dev` - Run the MCP dev HTTP server.
- `npm run mcp:prod` - Run the MCP production server entry.
- `npm run mcp:test` - Run MCP test harness.

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

For more details about the internal tooling and docs, see `src/mastra/docs/README.md` and `.github/copilot-instructions.md` in the repository.
