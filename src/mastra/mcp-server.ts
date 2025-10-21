import { MCPServer } from "@mastra/mcp";
import { shadcnSvelteComponentSearchTool } from "./tools/shadcn-svelte-component-search";
import { shadcnSvelteComponentDetailsTool } from "./tools/shadcn-svelte-component-details";
import { shadcnSvelteDocsSearchTool } from "./tools/shadcn-svelte-docs-search";
import { shadcnSvelteInstallationTool } from "./tools/shadcn-svelte-installation";
import { shadcnSvelteMigrationTool } from "./tools/shadcn-svelte-migration";

export const shadcn = new MCPServer({
  name: "Shadcn Svelte Documentation Server",
  version: "1.0.0",
  tools: {
    shadcnSvelteComponentSearchTool,
    shadcnSvelteComponentDetailsTool,
    shadcnSvelteDocsSearchTool,
    shadcnSvelteInstallationTool,
    shadcnSvelteMigrationTool,
  },
});
