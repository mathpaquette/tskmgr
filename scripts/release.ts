#!/usr/bin/env node
/**
 * Usage: npx ts-node scripts/release.ts
 */

// @ts-ignore
import yargs from 'yargs/yargs';
import { execSync } from 'child_process';

const argv = yargs(process.argv.slice(2)).options({
  a: { type: 'boolean', default: false },
  // newVersion: { type: 'string', demandOption: true },
  // c: { type: 'number', alias: 'chill' },
  // d: { type: 'array' },
  // e: { type: 'count' },
  // f: { choices: ['1', '2', '3'] },
}).argv;

execSync(`sh scripts/npm.sh`, { stdio: 'inherit' });
