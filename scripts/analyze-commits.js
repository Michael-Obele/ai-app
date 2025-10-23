#!/usr/bin/env node
import { execSync } from 'child_process';

function parseHeader(header) {
  // Conventional commit header: type(scope)!: subject
  const re = /^([a-z]+)(?:\(([^)]+)\))?(!)?:\s*(.*)$/i;
  const m = header.match(re);
  if (!m) return null;
  return { type: m[1], scope: m[2] || null, breaking: !!m[3], subject: m[4] };
}

function bumpFromCommit(parsed) {
  if (!parsed) return null;
  if (parsed.breaking) return 'major';
  const t = parsed.type.toLowerCase();
  if (t === 'fix' || t === 'perf') return 'patch';
  if (t === 'feat') {
    // custom rule: feat(scope=minor) => minor, otherwise feat => patch
    if (parsed.scope && parsed.scope.toLowerCase() === 'minor') return 'minor';
    return 'patch';
  }
  return null; // no release
}

function mostSignificant(a, b) {
  const order = { none: 0, patch: 1, minor: 2, major: 3 };
  if (!a) return b || 'none';
  if (!b) return a || 'none';
  return order[a] >= order[b] ? a : b;
}

function main() {
  const n = process.argv[2] || '20';
  const gitLog = execSync(`git log -n ${n} --pretty=%s`, { encoding: 'utf8' });
  const headers = gitLog.split('\n').filter(Boolean);
  if (headers.length === 0) {
    console.log('No commits found');
    process.exit(0);
  }

  let overall = 'none';
  console.log(`Analyzing ${headers.length} commits (most recent first):\n`);
  for (const h of headers) {
    const parsed = parseHeader(h);
    const bump = bumpFromCommit(parsed) || 'none';
    console.log(`- ${h}`);
    console.log(`  -> parsed: ${parsed ? JSON.stringify(parsed) : 'unparsed'}, bump: ${bump}`);
    overall = mostSignificant(overall, bump);
  }

  console.log('\nOverall suggested release type:', overall);
}

main();
