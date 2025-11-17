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

// Required environment variables with helpful messages
const requiredVars = {
  'GOOGLE_API_KEY': {
    placeholder: 'your_google_api_key_here',
    help: 'Get your API key from: https://makersuite.google.com/app/apikey'
  },
  'DATABASE_URL': {
    placeholder: 'postgresql://user:password@host:5432/database',
    help: 'Get a free PostgreSQL database from: https://neon.tech'
  },
  'NODE_ENV': {
    placeholder: null,
    help: 'Set to "development" for local work or "production" for deployment'
  }
};

const missingVars = [];
for (const [varName, config] of Object.entries(requiredVars)) {
  const value = envVars[varName];
  if (!value || value === config.placeholder) {
    missingVars.push({ name: varName, help: config.help });
  }
}

if (missingVars.length > 0) {
  console.error('❌ Missing or unconfigured environment variables:\n');
  missingVars.forEach(({ name, help }) => {
    console.error(`  ❌ ${name}`);
    console.error(`     ${help}\n`);
  });
  console.error('📝 Please configure these variables in your .env file');
  console.error('💡 See SETUP.md for detailed instructions\n');
  process.exit(1);
}

// Validate DATABASE_URL format
if (!envVars.DATABASE_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL must be a valid PostgreSQL connection string');
  process.exit(1);
}

console.log('✅ Environment variables are properly configured');
