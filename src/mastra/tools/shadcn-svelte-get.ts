import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import {
  fetchComponentDocs,
  fetchGeneralDocs,
  type ScrapeResult,
} from "../../services/doc-fetcher.js";
import { getFromCache, saveToCache } from "../../services/cache-manager.js";

// Tool for getting detailed information about components or documentation
export const shadcnSvelteGetTool = createTool({
  id: "shadcn-svelte-get",
  description:
    "Get detailed information about any shadcn-svelte component or documentation section from the live website",
  inputSchema: z.object({
    name: z.string().describe("Name of the component or documentation section"),
    type: z
      .enum(["component", "doc"])
      .describe("Type: 'component' for UI components, 'doc' for documentation"),
  }),
  execute: async ({ context }) => {
    const { name, type } = context;

    try {
      if (type === "component") {
        // Check cache first
        const cacheKey = `component:${name}`;
        let cached = await getFromCache<ScrapeResult>(cacheKey);

        let result;
        if (cached) {
          console.log(`Cache hit for component: ${name}`);
          result = cached;
        } else {
          console.log(`Fetching component from web: ${name}`);
          result = await fetchComponentDocs(name);

          if (result.success && result.markdown) {
            // Save to cache
            await saveToCache(cacheKey, result);
          }
        }

        if (!result.success) {
          return `Component "${name}" not found or error occurred: ${result.error}\n\nUse the list tool to see available components.`;
        }

        if (!result.markdown) {
          return `Component "${name}" not found. Use the list tool to see available components.`;
        }

        return `# ${name} Component\n\n${result.markdown}`;
      } else if (type === "doc") {
        // Check cache first
        const cacheKey = `doc:${name}`;
        let cached = await getFromCache<ScrapeResult>(cacheKey);

        let result;
        if (cached) {
          console.log(`Cache hit for doc: ${name}`);
          result = cached;
        } else {
          console.log(`Fetching doc from web: ${name}`);
          // Try common documentation paths
          const paths = [
            `/docs/${name}`,
            `/docs/installation/${name}`,
            `/docs/dark-mode/${name}`,
            `/docs/migration/${name}`,
          ];

          for (const path of paths) {
            result = await fetchGeneralDocs(path);
            if (result.success && result.markdown) {
              await saveToCache(cacheKey, result);
              break;
            }
          }
        }

        if (!result || !result.success || !result.markdown) {
          return `Documentation "${name}" not found. Use the list tool to see available documentation sections.`;
        }

        return `# ${name}\n\n${result.markdown}`;
      }

      return `Invalid type "${type}". Use "component" or "doc".`;
    } catch (error) {
      return `Error retrieving ${type} "${name}": ${error}`;
    }
  },
});
