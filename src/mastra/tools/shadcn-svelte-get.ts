import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname, resolve } from "path";

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

// Helper function to parse MDX frontmatter
function parseMdxFrontmatter(content: string): any {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);

  if (!match) return {};

  const frontmatter = match[1];
  const result: any = {};

  // Simple YAML-like parsing for common fields
  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length > 0) {
      const value = valueParts.join(":").trim();
      // Remove quotes if present
      result[key.trim()] = value.replace(/^["']|["']$/g, "");
    }
  }

  return result;
}

// Helper function to analyze component files
function analyzeComponentFiles(componentName: string): any {
  try {
    const registry = JSON.parse(
      readFileSync(join(DOCS_PATH, "registry.json"), "utf-8")
    );
    const component = registry.items.find(
      (item: any) => item.name === componentName
    );

    if (!component) return null;

    const analysis: any = {
      name: component.name,
      type: component.type,
      dependencies: component.registryDependencies || [],
      files: [],
    };

    // Analyze each file
    for (const file of component.files || []) {
      if (file.type === "registry:file") {
        const filePath = join(DOCS_PATH, file.path);
        try {
          const content = readFileSync(filePath, "utf-8");

          if (file.path.endsWith(".svelte")) {
            // Analyze Svelte component
            const props = extractPropsFromSvelte(content);
            const events = extractEventsFromSvelte(content);
            const slots = extractSlotsFromSvelte(content);

            analysis.files.push({
              path: file.path,
              type: "svelte",
              props,
              events,
              slots,
            });
          } else if (file.path.endsWith(".ts")) {
            analysis.files.push({
              path: file.path,
              type: "typescript",
              content:
                content.substring(0, 500) + (content.length > 500 ? "..." : ""),
            });
          }
        } catch (error) {
          analysis.files.push({
            path: file.path,
            error: `Could not read file: ${error}`,
          });
        }
      }
    }

    return analysis;
  } catch (error) {
    return { error: `Failed to analyze component: ${error}` };
  }
}

// Helper functions for Svelte component analysis
function extractPropsFromSvelte(content: string): string[] {
  const props: string[] = [];
  const propRegex = /let\s*\{\s*([^}]+)\s*\}\s*=\s*\$props\(\)/g;
  const match = content.match(propRegex);

  if (match) {
    const propString = match[0].match(/\{([^}]+)\}/)?.[1];
    if (propString) {
      props.push(
        ...propString.split(",").map((p) => p.trim().split("=")[0].trim())
      );
    }
  }

  return props;
}

function extractEventsFromSvelte(content: string): string[] {
  const events: string[] = [];
  const eventRegex = /on([a-zA-Z]+)=/g;
  let match;

  while ((match = eventRegex.exec(content)) !== null) {
    events.push(match[1]);
  }

  return [...new Set(events)]; // Remove duplicates
}

function extractSlotsFromSvelte(content: string): string[] {
  const slots: string[] = [];
  const slotRegex = /<slot[^>]*name=["']([^"']+)["'][^>]*>/g;
  let match;

  while ((match = slotRegex.exec(content)) !== null) {
    slots.push(match[1]);
  }

  // Check for default slot
  if (content.includes("<slot") && !content.includes("<slot name=")) {
    slots.unshift("default");
  }

  return [...new Set(slots)]; // Remove duplicates
}

// Tool for getting detailed information about components or documentation
export const shadcnSvelteGetTool = createTool({
  id: "shadcn-svelte-get",
  description:
    "Get detailed information about any shadcn-svelte component or documentation section",
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
        // Get component information
        const componentAnalysis = analyzeComponentFiles(name);

        if (!componentAnalysis) {
          return `Component "${name}" not found. Use the list tool to see available components.`;
        }

        // Get documentation
        const docPath = join(DOCS_PATH, "content", "components", `${name}.md`);
        let documentation = "";
        try {
          documentation = readFileSync(docPath, "utf-8");
        } catch (error) {
          documentation = "No documentation available.";
        }

        let result = `# ${name}\n\n`;

        if (componentAnalysis.error) {
          result += `**Error:** ${componentAnalysis.error}\n\n`;
        } else {
          result += `**Type:** ${componentAnalysis.type}\n`;
          result += `**Dependencies:** ${componentAnalysis.dependencies.join(", ") || "None"}\n\n`;

          // Show file analysis
          result += `## Files\n\n`;
          for (const file of componentAnalysis.files) {
            result += `### ${file.path}\n`;
            if (file.type === "svelte") {
              result += `**Props:** ${file.props.join(", ") || "None"}\n`;
              result += `**Events:** ${file.events.join(", ") || "None"}\n`;
              result += `**Slots:** ${file.slots.join(", ") || "None"}\n\n`;
            } else if (file.type === "typescript") {
              result += `**Content:**\n\`\`\`typescript\n${file.content}\n\`\`\`\n\n`;
            } else if (file.error) {
              result += `**Error:** ${file.error}\n\n`;
            }
          }
        }

        result += `## Documentation\n\n${documentation}`;

        return result;
      } else if (type === "doc") {
        // Get documentation
        const docPath = join(DOCS_PATH, "content", `${name}.md`);
        let documentation = "";

        try {
          documentation = readFileSync(docPath, "utf-8");
        } catch (error) {
          // Try subdirectories
          const contentPath = join(DOCS_PATH, "content");
          const findDoc = (dirPath: string): string | null => {
            try {
              const items = readdirSync(dirPath);
              for (const item of items) {
                const fullPath = join(dirPath, item);
                const stat = statSync(fullPath);

                if (stat.isDirectory()) {
                  const found = findDoc(fullPath);
                  if (found) return found;
                } else if (item === `${name}.md`) {
                  return fullPath;
                }
              }
            } catch (e) {
              // Continue searching
            }
            return null;
          };

          const foundPath = findDoc(contentPath);
          if (foundPath) {
            documentation = readFileSync(foundPath, "utf-8");
          } else {
            return `Documentation "${name}" not found. Use the list tool to see available documentation sections.`;
          }
        }

        // Parse frontmatter if it's MDX
        const frontmatter = parseMdxFrontmatter(documentation);
        const contentWithoutFrontmatter = documentation.replace(
          /^---\n[\s\S]*?\n---\n/,
          ""
        );

        let result = `# ${name}\n\n`;

        if (frontmatter.title) {
          result += `**Title:** ${frontmatter.title}\n`;
        }
        if (frontmatter.description) {
          result += `**Description:** ${frontmatter.description}\n`;
        }

        result += `\n## Content\n\n${contentWithoutFrontmatter}`;

        return result;
      }

      return `Invalid type "${type}". Use "component" or "doc".`;
    } catch (error) {
      return `Error retrieving ${type} "${name}": ${error}`;
    }
  },
});
