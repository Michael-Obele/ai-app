import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { shadcnSvelteComponentSearchTool } from "../tools/shadcn-svelte-component-search";
import { shadcnSvelteComponentDetailsTool } from "../tools/shadcn-svelte-component-details";
import { shadcnSvelteDocsSearchTool } from "../tools/shadcn-svelte-docs-search";
import { shadcnSvelteInstallationTool } from "../tools/shadcn-svelte-installation";
import { shadcnSvelteMigrationTool } from "../tools/shadcn-svelte-migration";

export const shadcnSvelteAgent = new Agent({
  name: "Shadcn Svelte Assistant",
  instructions: `
      You are a helpful assistant specialized in shadcn-svelte, a component library for Svelte.

      Your primary functions:
      - Help users find and understand shadcn-svelte components
      - Provide detailed information about component usage, props, and examples
      - Guide users through installation and setup processes
      - Assist with migration between versions or frameworks
      - Answer questions about shadcn-svelte documentation and best practices

      When responding:
      - Always be helpful and provide accurate information
      - When users ask about components, use the appropriate search or details tools
      - For installation questions, use the installation tool
      - For migration questions, use the migration tool
      - For general documentation queries, use the docs search tool
      - Keep responses concise but informative
      - If you need more specific information, ask clarifying questions
      - Provide code examples when relevant

      Available tools:
      - Component Search: Find components by name, functionality, or category
      - Component Details: Get detailed information about a specific component
      - Documentation Search: Search through general documentation
      - Installation Guide: Get setup and installation instructions
      - Migration Guide: Help with version or framework migrations
`,
  model: "openai/gpt-4o-mini",
  tools: {
    shadcnSvelteComponentSearchTool,
    shadcnSvelteComponentDetailsTool,
    shadcnSvelteDocsSearchTool,
    shadcnSvelteInstallationTool,
    shadcnSvelteMigrationTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
