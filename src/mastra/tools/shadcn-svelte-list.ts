import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getAllContent } from "../../services/component-discovery.js";

// Tool for listing all available components and documentation
export const shadcnSvelteListTool = createTool({
  id: "shadcn-svelte-list",
  description:
    "List all available shadcn-svelte components and documentation sections by discovering them from the live website",
  inputSchema: z.object({
    type: z
      .enum(["components", "docs", "all"])
      .optional()
      .default("all")
      .describe("What to list: components, docs, or all"),
  }),
  execute: async ({ context }) => {
    const { type = "all" } = context;

    try {
      // Get all content from discovery service
      const content = await getAllContent();

      let result = "# shadcn-svelte Resources\n\n";

      // List components if requested
      if (type === "components" || type === "all") {
        result += "## Components\n\n";
        result += `Found ${content.components.length} components:\n\n`;

        // Display in columns for better readability
        const columns = 3;
        for (let i = 0; i < content.components.length; i += columns) {
          const row = content.components
            .slice(i, i + columns)
            .map((c) => `\`${c.name}\``)
            .join(" · ");
          result += `${row}\n`;
        }
        result += "\n";
      }

      // List documentation if requested
      if (type === "docs" || type === "all") {
        result += "## Documentation\n\n";

        result += "### Installation\n";
        for (const doc of content.docs.installation) {
          result += `- \`${doc}\`\n`;
        }
        result += "\n";

        result += "### Dark Mode\n";
        for (const doc of content.docs.darkMode) {
          result += `- \`${doc}\`\n`;
        }
        result += "\n";

        result += "### Migration\n";
        for (const doc of content.docs.migration) {
          result += `- \`${doc}\`\n`;
        }
        result += "\n";

        result += "### General\n";
        for (const doc of content.docs.general) {
          result += `- \`${doc}\`\n`;
        }
        result += "\n";
      }

      result +=
        "---\n\n**Usage:** Use the `get` tool with `name` and `type` to retrieve detailed information.\n\n";
      result += "**Examples:**\n";
      result +=
        "- Get button component: `{ name: 'button', type: 'component' }`\n";
      result +=
        "- Get installation docs: `{ name: 'sveltekit', type: 'doc' }`\n";

      return result;
    } catch (error) {
      return `Error listing resources: ${error}`;
    }
  },
});
