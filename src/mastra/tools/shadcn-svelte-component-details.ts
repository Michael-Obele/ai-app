import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { object, string, parse } from "valibot";
import { readFileSync } from "fs";
import { join } from "path";

const DOCS_PATH = "/home/node/Documents/GitHub/ai-app/src/docs";

// Valibot schema for component details
const componentDetailsSchema = object({
  componentName: string("Component name is required"),
});

// Helper function to read markdown files
function readMarkdownFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

// Helper function to get detailed component information
function getComponentDetails(componentName: string) {
  try {
    const registry = JSON.parse(
      readFileSync(join(DOCS_PATH, "registry.json"), "utf-8")
    );
    const component = registry.items.find(
      (item: any) => item.name === componentName
    );

    if (component) {
      const docPath = join(
        DOCS_PATH,
        "content",
        "components",
        `${componentName}.md`
      );
      const documentation = readMarkdownFile(docPath);

      return {
        name: component.name,
        type: component.type,
        category: component.category,
        description: component.description,
        dependencies: component.registryDependencies || [],
        files: component.files?.map((f: any) => f.path) || [],
        props: component.props || [],
        documentation: documentation || "Documentation not found",
      };
    }
  } catch (error) {
    return { error: `Error reading component info: ${error}` };
  }

  return { error: `Component "${componentName}" not found` };
}

export const shadcnSvelteComponentDetailsTool = createTool({
  id: "shadcn-svelte-component-details",
  description:
    "Get detailed information about a specific shadcn-svelte component including props, usage, and full documentation.",
  inputSchema: z.object({
    componentName: z
      .string()
      .describe(
        "The exact name of the component (e.g., 'button', 'input', 'dialog')"
      ),
  }),
  execute: async ({ context }) => {
    const { componentName } = parse(componentDetailsSchema, context);

    const componentInfo = getComponentDetails(componentName);

    if (componentInfo.error) {
      return `Component "${componentName}" not found. Use the component search tool to find available components.`;
    }

    const propsInfo =
      componentInfo.props.length > 0
        ? componentInfo.props
            .map(
              (prop: any) =>
                `- **${prop.name}**: ${prop.type} - ${prop.description || "No description"}`
            )
            .join("\n")
        : "No props documented";

    return `
# ${componentInfo.name} Component

**Type:** ${componentInfo.type}
**Category:** ${componentInfo.category}
**Description:** ${componentInfo.description}

## Dependencies
${componentInfo.dependencies.join(", ") || "None"}

## Files
${componentInfo.files.map((file: string) => `- ${file}`).join("\n")}

## Props
${propsInfo}

## Documentation
${componentInfo.documentation}
    `.trim();
  },
});
