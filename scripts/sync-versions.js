#!/usr/bin/env node
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Get the latest tag from git
const latestTag = execSync("git tag --sort=-version:refname | head -1", {
  encoding: "utf8",
}).trim();
const version = latestTag.startsWith("v") ? latestTag.slice(1) : latestTag;

console.log(`Latest tag: ${latestTag}, version: ${version}`);

// Update package.json
const pkgPath = path.resolve(process.cwd(), "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`Updated ${pkgPath} to ${version}`);

// Update mcp-server.ts
const targetPath = path.resolve(process.cwd(), "src/mastra/mcp-server.ts");
let code = fs.readFileSync(targetPath, "utf8");
code = code.replace(/version:\s*"[^"]+",/, `version: "${version}",`);
fs.writeFileSync(targetPath, code);
console.log(`Updated ${targetPath} to ${version}`);

// Run version check
execSync("node scripts/check-versions.js", { stdio: "inherit" });
