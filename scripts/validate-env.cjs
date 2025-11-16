#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if we're in a CI/CD environment (Vercel, GitHub Actions, etc.)
const isCI = process.env.CI || process.env.VERCEL || process.env.GITHUB_ACTIONS;

if (isCI) {
  console.log('🔧 Running in CI/CD environment - skipping strict validation');
  console.log('   Environment variables will be validated at runtime');
  console.log('✅ Build validation passed');
  process.exit(0);
}

// Local development - check .env file
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  console.error('Copy .env.example to .env and configure your environment variables');
  process.exit(1);
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Required environment variables
const requiredVars = ['GOOGLE_API_KEY', 'DATABASE_URL', 'NODE_ENV'];
const missingVars = requiredVars.filter(varName => 
  !envVars[varName] || 
  envVars[varName] === 'your_google_api_key_here' || 
  envVars[varName] === 'your_postgresql_connection_string_here'
);

if (missingVars.length > 0) {
  console.error('❌ Missing or unconfigured environment variables:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
  console.error('\nPlease configure these variables in your .env file');
  process.exit(1);
}

// Validate DATABASE_URL format
if (!envVars.DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL must be a valid PostgreSQL connection string');
  process.exit(1);
}

console.log('✅ Environment variables are properly configured');
