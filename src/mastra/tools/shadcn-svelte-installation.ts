import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { object, optional, picklist, parse } from "valibot";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DOCS_PATH = "/home/node/Documents/GitHub/ai-app/src/docs";

// Valibot schema for installation guide
const installationGuideSchema = object({
  framework: optional(
    picklist(["sveltekit", "vite", "astro", "sapper", "plain-svelte"])
  ),
  packageManager: optional(picklist(["npm", "yarn", "pnpm", "bun"])),
});

// Helper function to read markdown files
function readMarkdownFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

// Helper function to get installation guides
function getInstallationGuide(
  framework?: string,
  packageManager?: string
): string {
  const installationPath = join(DOCS_PATH, "content", "installation");

  try {
    // Try to find framework-specific installation guide
    if (framework) {
      const frameworkFile = join(installationPath, `${framework}.md`);
      const content = readMarkdownFile(frameworkFile);
      if (!content.includes("Error reading file")) {
        return `# Installation Guide for ${framework}\n\n${content}`;
      }
    }

    // Try to find general installation guide
    const generalFile = join(installationPath, "index.md");
    const generalContent = readMarkdownFile(generalFile);
    if (!generalContent.includes("Error reading file")) {
      let content = generalContent;

      // Add package manager specific instructions if requested
      if (packageManager) {
        const pmInstructions = getPackageManagerInstructions(packageManager);
        content += `\n\n## Using ${packageManager}\n\n${pmInstructions}`;
      }

      return `# General Installation Guide\n\n${content}`;
    }

    // Fallback: search all installation files
    const results: string[] = [];
    const items = readdirSync(installationPath);

    for (const item of items) {
      if (extname(item) === ".md") {
        const content = readMarkdownFile(join(installationPath, item));
        if (content.toLowerCase().includes("install")) {
          results.push(`## ${item.replace(".md", "")}\n\n${content}\n\n---\n`);
        }
      }
    }

    return results.length > 0
      ? results.join("\n")
      : "No installation guides found. Please check the documentation structure.";
  } catch (error) {
    return `Error reading installation guides: ${error}`;
  }
}

// Helper function to get package manager specific instructions
function getPackageManagerInstructions(packageManager: string): string {
  const instructions: Record<string, string> = {
    npm: `# Using npm
\`\`\`bash
npm install @shadcn-svelte/ui
npm run dev
\`\`\``,
    yarn: `# Using yarn
\`\`\`bash
yarn add @shadcn-svelte/ui
yarn dev
\`\`\``,
    pnpm: `# Using pnpm
\`\`\`bash
pnpm add @shadcn-svelte/ui
pnpm dev
\`\`\``,
    bun: `# Using bun
\`\`\`bash
bun add @shadcn-svelte/ui
bun dev
\`\`\``,
  };

  return (
    instructions[packageManager] ||
    `# Using ${packageManager}
Please refer to your package manager's documentation for installation commands.`
  );
}

export const shadcnSvelteInstallationTool = createTool({
  id: "shadcn-svelte-installation",
  description:
    "Get installation and setup guides for shadcn-svelte, including framework-specific instructions and package manager commands.",
  inputSchema: z.object({
    framework: z
      .enum(["sveltekit", "vite", "astro", "sapper", "plain-svelte"])
      .optional()
      .describe("The framework you're using (e.g., 'sveltekit', 'vite')"),
    packageManager: z
      .enum(["npm", "yarn", "pnpm", "bun"])
      .optional()
      .describe("Your preferred package manager"),
  }),
  execute: async ({ context }) => {
    const { framework, packageManager } = parse(
      installationGuideSchema,
      context
    );

    const guide = getInstallationGuide(framework, packageManager);

    if (
      guide.includes("Error reading") ||
      guide.includes("No installation guides found")
    ) {
      return `${guide}\n\nTry searching the general documentation for installation information.`;
    }

    return guide;
  },
});
