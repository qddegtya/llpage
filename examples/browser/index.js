#!/usr/bin/env node

/**
 * LLPage Browser entry point
 * Launches the browser application
 */

const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// Pass all args except the first two
const args = process.argv.slice(2);

// Add source directory to args
args.unshift(path.join(__dirname, 'src/main.js'));

// Spawn Electron process
const proc = spawn(electron, args, { stdio: 'inherit' });

proc.on('close', (code) => {
  process.exit(code);
});
