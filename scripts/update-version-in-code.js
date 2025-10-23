#!/usr/bin/env node
import fs from "fs";
import path from "path";

const pkgPath = path.resolve(process.cwd(), "package.json");
const targetPath = path.resolve(process.cwd(), "src/mastra/mcp-server.ts");

if (!fs.existsSync(pkgPath)) {
  console.error("package.json not found");
  process.exit(1);
}
if (!fs.existsSync(targetPath)) {
  console.error("target file not found:", targetPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;

let code = fs.readFileSync(targetPath, "utf8");

// Replace a line like: version: "1.0.0",
const newCode = code.replace(/version:\s*"[^"]+",/, `version: "${version}",`);

if (newCode === code) {
  console.log("No change needed in", targetPath);
  process.exit(0);
}

fs.writeFileSync(targetPath, newCode, "utf8");
console.log(`Updated ${targetPath} to version ${version}`);
