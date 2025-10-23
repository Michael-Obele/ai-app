#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const targetPath = path.resolve(process.cwd(), 'src/mastra/mcp-server.ts');

if (!fs.existsSync(pkgPath)) {
  console.error('package.json not found');
  process.exit(1);
}
if (!fs.existsSync(targetPath)) {
  console.error('target file not found:', targetPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const packageVersion = pkg.version;

const code = fs.readFileSync(targetPath, 'utf8');
const match = code.match(/version:\s*"([^"]+)"/);
if (!match) {
  console.error('Version not found in', targetPath);
  process.exit(1);
}
const codeVersion = match[1];

if (packageVersion !== codeVersion) {
  console.error(`Version mismatch: package.json has ${packageVersion}, ${targetPath} has ${codeVersion}`);
  process.exit(1);
}

console.log(`Versions match: ${packageVersion}`);