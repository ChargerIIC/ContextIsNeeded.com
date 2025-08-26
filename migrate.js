#!/usr/bin/env node

/**
 * Simple runner for the Firebase migration script
 * Usage: node migrate.js
 */

const { exec } = require('child_process');
const path = require('path');

console.log('🔄 Starting Firebase migration...\n');

// Run the TypeScript migration script
exec('npx tsx scripts/migrate-to-firebase.ts', (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Migration failed: ${error.message}`);
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`⚠️ Warning: ${stderr}`);
  }
  
  console.log(stdout);
  console.log('\n✅ Migration completed!');
});
