import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, resolve } from "path";

// Find project root by looking for package.json
// This works even if Mastra changes the working directory
function findProjectRoot(): string {
  let currentPath = process.cwd();

  // Check if we're already in project root or .mastra/output
  if (existsSync(join(currentPath, "src", "mastra", "docs", "registry.json"))) {
    return currentPath;
  }

  // If we're in .mastra/output, go up two levels
  if (
    currentPath.endsWith(".mastra/output") ||
    currentPath.includes("/.mastra/output")
  ) {
    return resolve(currentPath, "../..");
  }

  // Walk up the directory tree to find package.json
  while (currentPath !== "/") {
    if (existsSync(join(currentPath, "package.json"))) {
      return currentPath;
    }
    currentPath = resolve(currentPath, "..");
  }

  // Fallback to process.cwd()
  return process.cwd();
}

const PROJECT_ROOT = findProjectRoot();
const DOCS_PATH = join(PROJECT_ROOT, "src", "mastra", "docs");

// Tool for listing all available components and documentation
export const shadcnSvelteListTool = createTool({
  id: "shadcn-svelte-list",
  description:
    "List all available shadcn-svelte components and documentation sections",
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
      const registry = JSON.parse(
        readFileSync(join(DOCS_PATH, "registry.json"), "utf-8")
      );

      let result = "# shadcn-svelte Resources\n\n";

      // List components if requested
      if (type === "components" || type === "all") {
        result += "## Components\n\n";

        // Get UI components
        const uiComponents = registry.items
          .filter((item: any) => item.type === "registry:ui")
          .map((item: any) => `- **${item.name}**`)
          .sort();

        // Get block components
        const blockComponents = registry.items
          .filter((item: any) => item.type === "registry:block")
          .map((item: any) => `- **${item.name}** (block)`)
          .sort();

        result += "### UI Components\n";
        result += uiComponents.join("\n") + "\n\n";

        if (blockComponents.length > 0) {
          result += "### Block Components\n";
          result += blockComponents.join("\n") + "\n\n";
        }
      }

      // List documentation if requested
      if (type === "docs" || type === "all") {
        result += "## Documentation\n\n";

        const contentPath = join(DOCS_PATH, "content");

        function listDocs(dirPath: string, prefix = ""): string[] {
          const items: string[] = [];

          try {
            const files = readdirSync(dirPath);

            for (const file of files) {
              const fullPath = join(dirPath, file);
              const stat = statSync(fullPath);

              if (stat.isDirectory()) {
                const subItems = listDocs(fullPath, `${prefix}${file}/`);
                items.push(...subItems);
              } else if (file.endsWith(".md")) {
                const name = file.replace(".md", "");
                const displayName = prefix ? `${prefix}${name}` : name;
                items.push(`- **${displayName}**`);
              }
            }
          } catch (error) {
            // Skip directories we can't read
          }

          return items.sort();
        }

        const docs = listDocs(contentPath);
        result += docs.join("\n") + "\n\n";
      }

      result +=
        "\nUse the 'get' tool to retrieve detailed information about any component or documentation section.";

      return result;
    } catch (error) {
      return `Error listing resources: ${error}`;
    }
  },
});
