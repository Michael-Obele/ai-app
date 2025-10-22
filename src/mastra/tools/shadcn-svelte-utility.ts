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

// Helper function to read markdown files
function readMarkdownFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

// Helper function to get package manager instructions
function getPackageManagerInstructions(packageManager: string): string {
  const instructions: Record<string, string> = {
    npm: `# npm
\`\`\`bash
npm install
\`\`\``,
    yarn: `# yarn
\`\`\`bash
yarn install
\`\`\``,
    pnpm: `# pnpm
\`\`\`bash
pnpm install
\`\`\``,
    bun: `# bun
\`\`\`bash
bun install
\`\`\``,
  };

  return instructions[packageManager] || instructions.npm;
}

// Tool for utility functions like installation and migration
export const shadcnSvelteUtilityTool = createTool({
  id: "shadcn-svelte-utility",
  description:
    "Utility tool for installation guides, migration help, and other shadcn-svelte tasks",
  inputSchema: z.object({
    action: z
      .enum(["install", "migrate", "help"])
      .describe("Action to perform: install, migrate, or help"),
    framework: z
      .enum(["sveltekit", "vite", "astro", "sapper", "plain-svelte"])
      .optional()
      .describe("Framework for installation"),
    packageManager: z
      .enum(["npm", "yarn", "pnpm", "bun"])
      .optional()
      .describe("Package manager preference"),
    fromVersion: z
      .string()
      .optional()
      .describe("Current version for migration"),
    toVersion: z.string().optional().describe("Target version for migration"),
  }),
  execute: async ({ context }) => {
    const {
      action,
      framework,
      packageManager = "npm",
      fromVersion,
      toVersion,
    } = context;

    try {
      if (action === "install") {
        const installationPath = join(DOCS_PATH, "content", "installation");

        let content = "";

        // Try framework-specific installation
        if (framework) {
          const frameworkFile = join(installationPath, `${framework}.md`);
          content = readMarkdownFile(frameworkFile);
          if (!content.includes("Error reading file")) {
            content = `# Installation for ${framework}\n\n${content}`;
          } else {
            // Fall back to general installation
            const generalFile = join(installationPath, "index.md");
            content = readMarkdownFile(generalFile);
            if (!content.includes("Error reading file")) {
              content = `# General Installation\n\n${content}`;
            }
          }
        } else {
          // General installation
          const generalFile = join(installationPath, "index.md");
          content = readMarkdownFile(generalFile);
          if (!content.includes("Error reading file")) {
            content = `# Installation Guide\n\n${content}`;
          }
        }

        // Add package manager specific instructions
        if (packageManager) {
          content += `\n\n## Package Manager Setup\n\n${getPackageManagerInstructions(packageManager)}`;
        }

        return content;
      } else if (action === "migrate") {
        const migrationPath = join(DOCS_PATH, "content", "migration");

        let content = "";

        // Try version-specific migration
        if (fromVersion && toVersion) {
          const versionFile = join(
            migrationPath,
            `from-${fromVersion}-to-${toVersion}.md`
          );
          content = readMarkdownFile(versionFile);
          if (!content.includes("Error reading file")) {
            content = `# Migration from ${fromVersion} to ${toVersion}\n\n${content}`;
          } else {
            // Fall back to general migration guide
            const generalFile = join(migrationPath, "index.md");
            content = readMarkdownFile(generalFile);
            if (!content.includes("Error reading file")) {
              content = `# Migration Guide\n\n${content}`;
            }
          }
        } else {
          // General migration guide
          const generalFile = join(migrationPath, "index.md");
          content = readMarkdownFile(generalFile);
          if (!content.includes("Error reading file")) {
            content = `# Migration Guide\n\n${content}`;
          }
        }

        // Check for Svelte 5 specific migration
        const svelte5Migration = join(migrationPath, "svelte-5.md");
        const svelte5Content = readMarkdownFile(svelte5Migration);
        if (!svelte5Content.includes("Error reading file")) {
          content += `\n\n## Svelte 5 Migration\n\n${svelte5Content}`;
        }

        return content;
      } else if (action === "help") {
        return `# shadcn-svelte Help

## Available Actions

### Installation
Get installation guides for different frameworks and package managers.

**Parameters:**
- \`framework\`: sveltekit, vite, astro, sapper, plain-svelte
- \`packageManager\`: npm, yarn, pnpm, bun

**Example:** Get SvelteKit installation with pnpm
\`\`\`json
{
  "action": "install",
  "framework": "sveltekit",
  "packageManager": "pnpm"
}
\`\`\`

### Migration
Get migration guides for upgrading between versions.

**Parameters:**
- \`fromVersion\`: Current version (optional)
- \`toVersion\`: Target version (optional)

**Example:** Get migration guide
\`\`\`json
{
  "action": "migrate",
  "fromVersion": "0.1.0",
  "toVersion": "1.0.0"
}
\`\`\`

## Other Tools

- **List Tool**: See all available components and documentation
- **Get Tool**: Get detailed information about specific components or docs

## Quick Start

1. Use the **list** tool to see what's available
2. Use the **get** tool to get details about specific items
3. Use this **utility** tool for installation and migration help

## Common Issues

- Make sure you're using Svelte 5 with runes (\`$state\`, \`$props\`, etc.)
- Check that your framework is properly configured
- Verify package manager compatibility`;
      }

      return `Unknown action "${action}". Use "install", "migrate", or "help".`;
    } catch (error) {
      return `Error performing ${action}: ${error}`;
    }
  },
});
