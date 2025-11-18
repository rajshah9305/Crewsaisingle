#!/bin/bash
set -e

echo "🔧 Vercel Build Script Starting..."

# Ensure we're in the project root
cd "$(dirname "$0")/.."

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building client with Vite..."
npm exec vite build

echo "🔨 Building server with esbuild..."
npm exec -- esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

echo "✅ Build completed successfully!"
ls -lh dist/
