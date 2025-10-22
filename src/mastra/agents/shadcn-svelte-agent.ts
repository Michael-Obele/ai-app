import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { shadcnSvelteListTool } from "../tools/shadcn-svelte-list";
import { shadcnSvelteGetTool } from "../tools/shadcn-svelte-get";
import { shadcnSvelteUtilityTool } from "../tools/shadcn-svelte-utility";

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
      - Use the LIST tool to show available components and documentation
      - Use the GET tool to retrieve detailed information about specific components or docs
      - Use the UTILITY tool for installation guides, migration help, and general assistance
      - Keep responses concise but informative
      - If you need more specific information, ask clarifying questions
      - Provide code examples when relevant

      Available tools:
      - LIST: Show all available components and documentation sections
      - GET: Get detailed information about any component or documentation
      - UTILITY: Installation guides, migration help, and general assistance
`,
  model: "openai/gpt-5-nano",
  tools: {
    shadcnSvelteListTool,
    shadcnSvelteGetTool,
    shadcnSvelteUtilityTool,
  },
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
});
