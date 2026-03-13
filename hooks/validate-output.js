#!/usr/bin/env node
import { readFileSync } from 'fs';

const REQUIRED_FIELDS = [
  'deal_name',
  'health_status',
  'risk_factors',
  'recommended_next_step',
  'forecast_note',
];

const input = JSON.parse(readFileSync('/dev/stdin', 'utf-8'));

const toolName = input?.tool_name ?? '';
const filePath = input?.tool_input?.file_path ?? '';

if (toolName !== 'Write' || !filePath.includes('output')) {
  process.exit(0);
}

let deals;
try {
  const content = readFileSync(filePath, 'utf-8');
  deals = JSON.parse(content);
} catch (err) {
  console.warn(`Warning: Could not read or parse ${filePath}: ${err.message}`);
  process.exit(0);
}

if (!Array.isArray(deals)) {
  console.warn(`Warning: ${filePath} does not contain a JSON array.`);
  process.exit(0);
}

const issues = [];

for (const deal of deals) {
  const name = deal.deal_name ?? '(unnamed deal)';
  const missing = REQUIRED_FIELDS.filter(
    (field) => !(field in deal) || deal[field] === null || deal[field] === undefined
  );
  if (missing.length > 0) {
    issues.push(`  - "${name}" is missing: ${missing.join(', ')}`);
  }
}

if (issues.length > 0) {
  console.warn(`Warning: Incomplete deals found in ${filePath}:`);
  for (const issue of issues) {
    console.warn(issue);
  }
}
