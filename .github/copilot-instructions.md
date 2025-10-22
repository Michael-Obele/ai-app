<!-- .github/copilot-instructions.md - guidance for AI coding agents -->

# AI assistant quick-start for this repository

This file gives concise, actionable instructions for an AI coding agent to be productive in this codebase.

1. What this repo is

- A Mastra-based AI tooling project that bundles: workflows, agents, MCP servers and custom tools. See `src/index.ts` for the Mastra bootstrap (workflows, agents, mcpServers).
- Documentation and component sources live under `src/mastra/docs/` (registry.json, `content/`, and helper code under `src/mastra/docs/lib`).

2. How to run / common developer commands

- Node engine: use Node >= 20.9.0 (see `package.json` "engines").
- Development (app-level): bun run dev (calls `mastra dev`).
- Note: for quick smoke-tests and CI checks, we use `bun run dev` only (see the smoke-test guideline below). Other MCP helper scripts exist in `package.json` but the canonical developer workflow relies on `bun run dev` for early error detection.

3. Big-picture architecture (quick map)

- Mastra instance (src/index.ts): central entry that composes workflows (src/mastra/workflows), agents (src/mastra/agents) and mcpServers (src/mastra/mcp-server).
- MCP server (src/mastra/mcp-server.\*): exposes an object `shadcn` used by `src/dev-server.ts` and `src/server.ts` via startSSE/startHTTP/close.
- Tools (src/mastra/tools/\*): each tool is created with `createTool(...)` from `@mastra/core/tools` and follows the pattern: zod input schema, execute({context}) returns result. Example tools: `shadcn-svelte-get`, `shadcn-svelte-list`, `shadcn-svelte-utility`.
- Docs & component registry: `src/mastra/docs/registry.json` lists components and files; `src/mastra/docs/content/` contains markdown documentation used by the tools.

4. Project-specific conventions and gotchas (do not invent alternatives)

- Tools expect Svelte components and docs to follow Svelte 5 runes patterns: props are extracted from `let { ... } = $props()` declarations (see `shadcn-svelte-get.ts` and `shadcn-svelte-component-details.ts`). When editing Svelte files, follow Svelte 5 runes (`$props()`, `$state()`, `$derived()`, `$effect()`) — the repo's tooling parses those patterns.
- Markdown frontmatter is expected between `---` markers; tools will parse a minimal YAML-like frontmatter (title, description, links, source/api fields). Avoid exotic frontmatter formats unless you also update parsers.
- File path resolution: tools resolve docs relative to the tool file (they use file URL + join with `../docs`) — prefer relative paths instead of hard-coded absolute paths.
- Registry-driven: many tools rely on `src/mastra/docs/registry.json`. If you add components, update registry.json accordingly or tools may not find files.
- Input validation: tools MUST use `zod` to validate inputs. Mastra's createTool requires Zod schemas for proper type inference and runtime validation. When updating or creating tools, use zod schemas (see existing examples in `src/mastra/tools/*`). Follow the pattern: `import { z } from "zod"` and define schemas with `z.object({...})`.

Important runtime smoke-test: always run `bun run dev` for a short smoke-test (10–15s) after making code changes to catch early runtime errors. This runs the full Mastra development lifecycle and surfaces integration/runtime errors that focused MCP runs may not catch. Perform the 10–15s `bun run dev` check before finalizing changes.

Caching: component analysis tools use an in-memory cache (`componentCache`) with a timeout — expect stale cached results when iterating; clear cache or restart the process during development if necessary.

5. Common edit patterns and examples (concrete references)

To add a new tool, mirror `src/mastra/tools/shadcn-svelte-get.ts`: export a tool using `createTool({ id, description, inputSchema: /* use zod schema here */, execute: async ({context}) => { ... } })`. Use Zod for schema validation as Mastra requires it for type inference. Follow existing project patterns for input parsing and error messages.

- To examine how components are discovered, inspect `src/mastra/tools/shadcn-svelte-get.ts` and `src/mastra/docs/registry.json`.
- To test changes quickly: run `bun run dev` and watch console output for errors during the 10–15s smoke-test window.

6. Integration & external deps

- Key runtime deps (see `package.json`): @mastra/core, @mastra/mcp, @mastra/loggers, @mastra/libsql, mastra CLI. Respect the pinned major versions when adding features unless requested.
- DB/storage: default `LibSQLStore` is configured in-memory (`url: ":memory:"`) in `src/index.ts` — switch to a file DB if persistence required.

7. Debugging tips for AI agents

- If a tool returns "not found", check `src/mastra/docs/registry.json` first, then `src/mastra/docs/content/...` for a matching `.md` file.
- Watch for absolute path constants (some early commit used absolute DOCS_PATH). Prefer the current pattern that computes DOCS_PATH via file URL.
- For runtime discovery iterate: change code and run `bun run dev` for 10–15s to surface issues; focus on reproducing the failing scenario in that window. If you need a focused MCP/stdio run for deeper debugging, run the specific script directly, but always perform the `bun run dev` smoke-test first.

8. What not to change without confirmation

- The Mastra bootstrap (`src/index.ts`) wiring of agents/workflows/mcpServers — changes affect all runtime behavior.
- Registry format and field names used by tools (`items[].name`, `items[].files[].path`, `items[].type`).

If anything above is unclear or you want more examples (e.g., a sample tool implementation or how to call the MCP endpoints from tests), tell me which area to expand and I will iterate.
