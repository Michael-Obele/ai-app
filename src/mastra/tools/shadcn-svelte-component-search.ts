import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { object, string, optional, picklist, parse } from "valibot";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DOCS_PATH = "/home/node/Documents/GitHub/ai-app/src/docs";

// Valibot schema for internal validation
const componentSearchSchema = object({
  query: string("Search query is required"),
  category: optional(
    picklist(["ui", "form", "layout", "navigation", "feedback", "data-display"])
  ),
  type: optional(picklist(["component", "primitive", "utility"])),
});

// Helper function to read registry
function readRegistry() {
  try {
    return JSON.parse(readFileSync(join(DOCS_PATH, "registry.json"), "utf-8"));
  } catch (error) {
    return { items: [] };
  }
}

// Helper function to search components in registry
function searchComponents(query: string, category?: string, type?: string) {
  const registry = readRegistry();
  const searchTerm = query.toLowerCase();

  const filteredComponents = registry.items.filter((component: any) => {
    const matchesQuery =
      component.name.toLowerCase().includes(searchTerm) ||
      component.description?.toLowerCase().includes(searchTerm) ||
      component.keywords?.some((keyword: string) =>
        keyword.toLowerCase().includes(searchTerm)
      );

    const matchesCategory = !category || component.category === category;
    const matchesType = !type || component.type === type;

    return matchesQuery && matchesCategory && matchesType;
  });

  return filteredComponents.map((component: any) => ({
    name: component.name,
    description: component.description || "No description available",
    category: component.category || "uncategorized",
    type: component.type || "component",
    dependencies: component.registryDependencies || [],
  }));
}

export const shadcnSvelteComponentSearchTool = createTool({
  id: "shadcn-svelte-component-search",
  description:
    "Search for shadcn-svelte components by name, functionality, or category. Use this to find components that match specific needs.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "What component are you looking for? (e.g., 'button', 'form input', 'modal')"
      ),
    category: z
      .enum(["ui", "form", "layout", "navigation", "feedback", "data-display"])
      .optional()
      .describe("Filter by component category"),
    type: z
      .enum(["component", "primitive", "utility"])
      .optional()
      .describe("Filter by component type"),
  }),
  execute: async ({ context }) => {
    const { query, category, type } = parse(componentSearchSchema, context);

    const results = searchComponents(query, category, type);

    if (results.length === 0) {
      return `No components found matching "${query}"${category ? ` in category "${category}"` : ""}${type ? ` of type "${type}"` : ""}. Try a broader search or different keywords.`;
    }

    const formattedResults = results
      .map(
        (component: any) =>
          `**${component.name}**\n- Description: ${component.description}\n- Category: ${component.category}\n- Type: ${component.type}\n- Dependencies: ${component.dependencies.join(", ") || "None"}\n`
      )
      .join("\n");

    return `Found ${results.length} component(s) matching your search:\n\n${formattedResults}`;
  },
});
