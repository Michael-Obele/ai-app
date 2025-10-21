import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { object, string, optional, picklist, parse } from "valibot";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DOCS_PATH = "/home/node/Documents/GitHub/ai-app/src/docs";

// Valibot schema for migration guide
const migrationGuideSchema = object({
  fromVersion: optional(string()),
  toVersion: optional(string()),
  framework: optional(picklist(["sveltekit", "vite", "astro"])),
});

// Helper function to read markdown files
function readMarkdownFile(filePath: string): string {
  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    return `Error reading file: ${error}`;
  }
}

// Helper function to get migration guides
function getMigrationGuide(
  fromVersion?: string,
  toVersion?: string,
  framework?: string
): string {
  const migrationPath = join(DOCS_PATH, "content", "migration");

  try {
    // Try to find version-specific migration guide
    if (fromVersion && toVersion) {
      const versionFile = join(
        migrationPath,
        `v${fromVersion}-to-v${toVersion}.md`
      );
      const content = readMarkdownFile(versionFile);
      if (!content.includes("Error reading file")) {
        return `# Migration Guide: v${fromVersion} to v${toVersion}\n\n${content}`;
      }
    }

    // Try to find framework-specific migration guide
    if (framework) {
      const frameworkFile = join(migrationPath, `${framework}.md`);
      const content = readMarkdownFile(frameworkFile);
      if (!content.includes("Error reading file")) {
        return `# Migration Guide for ${framework}\n\n${content}`;
      }
    }

    // Try to find general migration guide
    const generalFile = join(migrationPath, "index.md");
    const generalContent = readMarkdownFile(generalFile);
    if (!generalContent.includes("Error reading file")) {
      return `# General Migration Guide\n\n${generalContent}`;
    }

    // Fallback: search all migration files
    const results: string[] = [];
    const items = readdirSync(migrationPath);

    for (const item of items) {
      if (extname(item) === ".md") {
        const content = readMarkdownFile(join(migrationPath, item));
        if (
          content.toLowerCase().includes("migrat") ||
          content.toLowerCase().includes("upgrad")
        ) {
          results.push(`## ${item.replace(".md", "")}\n\n${content}\n\n---\n`);
        }
      }
    }

    return results.length > 0
      ? results.join("\n")
      : "No migration guides found. Please check the documentation structure.";
  } catch (error) {
    return `Error reading migration guides: ${error}`;
  }
}

export const shadcnSvelteMigrationTool = createTool({
  id: "shadcn-svelte-migration",
  description:
    "Get migration guides for upgrading shadcn-svelte versions or migrating between frameworks.",
  inputSchema: z.object({
    fromVersion: z
      .string()
      .optional()
      .describe(
        "Current version you're migrating from (e.g., '0.1.0', '1.0.0')"
      ),
    toVersion: z
      .string()
      .optional()
      .describe("Target version you're migrating to (e.g., '1.0.0', '2.0.0')"),
    framework: z
      .enum(["sveltekit", "vite", "astro"])
      .optional()
      .describe("Framework-specific migration guide"),
  }),
  execute: async ({ context }) => {
    const { fromVersion, toVersion, framework } = parse(
      migrationGuideSchema,
      context
    );

    const guide = getMigrationGuide(fromVersion, toVersion, framework);

    if (
      guide.includes("Error reading") ||
      guide.includes("No migration guides found")
    ) {
      return `${guide}\n\nTry searching the general documentation for migration information.`;
    }

    return guide;
  },
});
