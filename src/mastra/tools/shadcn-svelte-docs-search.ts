import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { object, string, optional, picklist, parse } from "valibot";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DOCS_PATH = "/home/node/Documents/GitHub/ai-app/src/docs";

// Valibot schema for documentation search
const docsSearchSchema = object({
  query: string("Search query is required"),
  category: optional(
    picklist([
      "components",
      "installation",
      "migration",
      "registry",
      "dark-mode",
      "theming",
      "styling",
    ])
  ),
});

// Helper function to read markdown files
function readMarkdownFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

// Helper function to search through documentation
function searchDocumentation(query: string, category?: string): string {
  const results: string[] = [];
  const searchTerm = query.toLowerCase();

  function searchDirectory(dirPath: string, currentCategory: string = "") {
    const items = readdirSync(dirPath);

    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        const newCategory = currentCategory
          ? `${currentCategory}/${item}`
          : item;
        if (!category || newCategory.includes(category)) {
          searchDirectory(fullPath, newCategory);
        }
      } else if (extname(item) === ".md") {
        const content = readMarkdownFile(fullPath);
        const title =
          content
            .split("\n")
            .find((line) => line.startsWith("# "))
            ?.replace("# ", "") || item.replace(".md", "");

        if (
          content.toLowerCase().includes(searchTerm) ||
          title.toLowerCase().includes(searchTerm) ||
          item.toLowerCase().includes(searchTerm)
        ) {
          // Extract first few paragraphs for preview
          const lines = content.split("\n");
          const preview = lines.slice(0, 20).join("\n").substring(0, 800);

          results.push(
            `## ${title}\n**File:** ${fullPath.replace(DOCS_PATH, "")}\n**Category:** ${currentCategory}\n\n${preview}...\n\n---\n`
          );
        }
      }
    }
  }

  searchDirectory(join(DOCS_PATH, "content"), category);

  return results.length > 0
    ? results.join("\n")
    : `No documentation found for "${query}"${category ? ` in category "${category}"` : ""}`;
}

export const shadcnSvelteDocsSearchTool = createTool({
  id: "shadcn-svelte-docs-search",
  description:
    "Search through shadcn-svelte documentation for guides, tutorials, and general information. Use this for non-component specific queries.",
  inputSchema: z.object({
    query: z
      .string()
      .describe(
        "What documentation are you looking for? (e.g., 'how to install', 'theming guide', 'migration to v1')"
      ),
    category: z
      .enum([
        "components",
        "installation",
        "migration",
        "registry",
        "dark-mode",
        "theming",
        "styling",
      ])
      .optional()
      .describe("Filter by documentation category"),
  }),
  execute: async ({ context }) => {
    const { query, category } = parse(docsSearchSchema, context);

    const searchResults = searchDocumentation(query, category);

    if (searchResults.includes("No documentation found")) {
      // Try a broader search
      const broadResults = searchDocumentation(query);
      if (!broadResults.includes("No documentation found")) {
        return `No results found in ${category || "specified category"}, but here are broader results:\n\n${broadResults}`;
      }
    }

    return searchResults;
  },
});
