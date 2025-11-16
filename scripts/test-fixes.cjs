#!/usr/bin/env node

/**
 * Test script to verify the fixes made to the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkFile(filePath, condition, message) {
  console.log(`Checking ${filePath}...`);
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (condition(content)) {
      console.log(`✅ ${message}`);
      return true;
    } else {
      console.error(`❌ ${message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking ${filePath}: ${error.message}`);
    return false;
  }
}

function runTests() {
  console.log('Running tests for code fixes...\n');
  let allPassed = true;

  // 1. Check API index fix
  allPassed &= checkFile(
    'api/index.ts',
    content => content.includes('export * from "../server/index.js"'),
    'API index file properly exports from server index'
  );

  // 2. Check storage-mock.ts fix
  allPassed &= checkFile(
    'server/storage-mock.ts',
    content => !content.includes('updatedAt:') && !content.includes('createdAt: new Date(),'),
    'Storage mock no longer references incorrect fields'
  );

  // 3. Check vite.ts static path fix
  allPassed &= checkFile(
    'server/vite.ts',
    content => content.includes('const distPath = path.resolve(import.meta.dirname, "..", "dist", "client")'),
    'Vite static path correctly points to dist/client'
  );

  // 4. Check package.json dotenv version
  allPassed &= checkFile(
    'package.json',
    content => content.includes('"dotenv": "^16.3.1"'),
    'Package.json has correct dotenv version'
  );

  // 5. Check Gemini test implementation
  allPassed &= checkFile(
    'server/gemini.test.ts',
    content => content.includes('jest.mock("@google/genai"') && content.includes('export {}'),
    'Gemini test file has proper mocking'
  );

  // 6. Check queryClient.ts fix
  allPassed &= checkFile(
    'client/src/lib/queryClient.ts',
    content => content.includes('API_BASE_URL') && content.includes('endpoint.replace'),
    'QueryClient has proper URL construction'
  );

  // Summary
  console.log('\n----- Test Summary -----');
  if (allPassed) {
    console.log('✅ All fixes have been successfully applied!');
  } else {
    console.error('❌ Some fixes are missing or incomplete. Please check the logs above.');
  }
}

try {
  runTests();
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}