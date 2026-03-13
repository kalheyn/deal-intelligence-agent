#!/usr/bin/env node
import { readFileSync } from 'fs';

const input = JSON.parse(readFileSync('/dev/stdin', 'utf-8'));

const toolName = input?.tool_name ?? '';
const filePath = input?.tool_input?.file_path ?? '';

if (toolName === 'Read' && /\.env|secrets/i.test(filePath)) {
  console.error('Access to sensitive files is not permitted.');
  process.exit(2);
}
