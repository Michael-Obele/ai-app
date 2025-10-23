import { MCPServer } from "@mastra/mcp";
import { shadcnSvelteListTool } from "./tools/shadcn-svelte-list";
import { shadcnSvelteGetTool } from "./tools/shadcn-svelte-get";
import { shadcnSvelteUtilityTool } from "./tools/shadcn-svelte-utility";

export const shadcn = new MCPServer({
  name: "Shadcn Svelte Docs",
  version: "1.0.0",
  tools: {
    shadcnSvelteListTool,
    shadcnSvelteGetTool,
    shadcnSvelteUtilityTool,
  },
});
