#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if package.json exists
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Required dependencies
const requiredDeps = [
  '@google/genai',
  '@neondatabase/serverless',
  'drizzle-orm',
  'express',
  'react',
  'react-dom',
  '@tanstack/react-query',
  'wouter',
  'zod'
];

// Check if all required dependencies are installed
const missingDeps = requiredDeps.filter(dep => 
  !packageJson.dependencies[dep] && !packageJson.devDependencies[dep]
);

if (missingDeps.length > 0) {
  console.error('❌ Missing required dependencies:');
  missingDeps.forEach(dep => console.error(`  - ${dep}`));
  console.error('\nRun: npm install');
  process.exit(1);
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.error('❌ node_modules not found. Run: npm install');
  process.exit(1);
}

console.log('✅ All dependencies are properly installed');
