// convertToNpm.js
const fs = require('fs');
const { execSync } = require('child_process');

console.log('Converting from pnpm to npm...');

// Delete pnpm-lock.yaml if it exists
try {
  if (fs.existsSync('pnpm-lock.yaml')) {
    fs.unlinkSync('pnpm-lock.yaml');
    console.log('Deleted pnpm-lock.yaml');
  }
} catch (err) {
  console.error('Error deleting pnpm-lock.yaml:', err);
}

// Create a new package-lock.json with npm
try {
  console.log('Installing dependencies with npm...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('Successfully installed dependencies with npm');
} catch (err) {
  console.error('Error installing dependencies with npm:', err);
}

console.log('Conversion complete. You can now use npm instead of pnpm.');
