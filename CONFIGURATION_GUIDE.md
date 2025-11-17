# ⚙️ Configuration Guide - package.json & vercel.json

## Overview

This guide explains how `package.json` and `vercel.json` work together to build and deploy the RAJAI Platform.

---

## 📦 package.json Configuration

### Build Scripts

```json
{
  "scripts": {
    "dev": "node scripts/validate-env.cjs && node scripts/validate-deps.cjs && NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js",
    "build:vercel": "npm run build",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "validate": "node scripts/validate-env.cjs && node scripts/validate-deps.cjs",
    "test": "npm run validate",
    "setup": "npm install && npm run validate && npm run db:push"
  }
}
```

### Script Breakdown

#### `npm run dev` - Development Server
```bash
node scripts/validate-env.cjs &&           # Validate environment variables
node scripts/validate-deps.cjs &&          # Validate dependencies
NODE_ENV=development tsx server/index.ts   # Start dev server with hot reload
```

**Purpose**: Local development with hot reload
**Output**: No build files, runs directly from source
**Port**: 5001 (default)

---

#### `npm run build` - Production Build
```bash
vite build &&                              # Build frontend
esbuild server/index.ts \                  # Bundle backend
  --platform=node \                        # Target Node.js
  --packages=external \                    # Don't bundle node_modules
  --bundle \                               # Bundle all imports
  --format=esm \                           # ES modules format
  --outfile=dist/index.js                  # Output file
```

**Purpose**: Create production-ready files
**Output**: 
- `dist/client/` - Frontend static files
- `dist/index.js` - Backend bundle

**Used by**: 
- Local production testing
- Traditional deployments (VPS, Docker)
- Vercel deployment (via `build:vercel`)

---

#### `npm run build:vercel` - Vercel Build
```bash
npm run build
```

**Purpose**: Alias for Vercel deployment
**Why**: Allows Vercel-specific customization if needed
**Output**: Same as `npm run build`

---

#### `npm start` - Production Server
```bash
NODE_ENV=production node dist/index.js
```

**Purpose**: Start production server
**Requires**: `npm run build` must be run first
**Used by**: Traditional deployments (not Vercel)

---

#### `npm run check` - Type Checking
```bash
tsc
```

**Purpose**: Validate TypeScript without building
**Output**: None (just checks for errors)
**Used by**: CI/CD, pre-commit checks

---

#### `npm run db:push` - Database Migration
```bash
drizzle-kit push
```

**Purpose**: Push database schema to PostgreSQL
**Requires**: `DATABASE_URL` environment variable
**Used by**: Initial setup, schema updates

---

#### `npm run validate` - Environment Validation
```bash
node scripts/validate-env.cjs &&
node scripts/validate-deps.cjs
```

**Purpose**: Validate configuration before running
**Checks**: 
- Environment variables are set
- Required dependencies are installed

---

#### `npm run setup` - Complete Setup
```bash
npm install &&
npm run validate &&
npm run db:push
```

**Purpose**: One-command setup for new installations
**Steps**:
1. Install dependencies
2. Validate configuration
3. Initialize database

---

## 🚀 vercel.json Configuration

### Complete Configuration

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 60,
      "memory": 1024,
      "runtime": "nodejs20.x"
    }
  },
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Configuration Breakdown

#### `version: 2`
- Specifies Vercel platform version
- Version 2 is the current stable version

---

#### `buildCommand: "npm run build"`
- Command Vercel runs to build the project
- Executes: `vite build && esbuild server/index.ts ...`
- Creates `dist/client/` and `dist/index.js`

---

#### `installCommand: "npm install"`
- Command to install dependencies
- Runs before `buildCommand`
- Uses npm by default

---

#### `outputDirectory: "dist/client"`
- Directory containing static files to serve
- Vercel serves these files from CDN
- Contains: HTML, CSS, JS, images

**Important**: This is the **frontend** output only

---

#### `rewrites`
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  }
]
```

**Purpose**: Route API requests to serverless function

**How it works**:
- User requests: `https://your-app.vercel.app/api/agents`
- Vercel routes to: `api/index.js` serverless function
- Function runs: `dist/index.js` (Express server)

---

#### `functions`
```json
"functions": {
  "api/index.js": {
    "maxDuration": 60,
    "memory": 1024,
    "runtime": "nodejs20.x"
  }
}
```

**Configuration**:
- `maxDuration: 60` - Function timeout (60 seconds)
- `memory: 1024` - Memory allocation (1GB)
- `runtime: "nodejs20.x"` - Node.js version

**File**: `api/index.js` imports and exports Express app

---

#### `regions: ["iad1"]`
- Deployment region (US East - Washington, D.C.)
- Can add multiple regions for global distribution
- Options: `iad1` (US East), `sfo1` (US West), `fra1` (Europe), etc.

---

#### `env`
```json
"env": {
  "NODE_ENV": "production"
}
```

**Purpose**: Set environment variables for all deployments

**Note**: Sensitive variables (API keys, database URLs) should be set in Vercel Dashboard, not in `vercel.json`

---

## 🔗 How They Work Together

### Local Development Flow

```
1. npm run dev
   ↓
2. Validates environment (scripts/validate-env.cjs)
   ↓
3. Validates dependencies (scripts/validate-deps.cjs)
   ↓
4. Starts tsx server (server/index.ts)
   ↓
5. Vite dev server serves frontend with HMR
   ↓
6. Express handles API routes
```

**No build required** - runs directly from source

---

### Production Build Flow

```
1. npm run build
   ↓
2. Vite builds frontend
   ├─ Compiles React/TypeScript
   ├─ Processes Tailwind CSS
   ├─ Code splits into chunks
   ├─ Minifies and optimizes
   └─ Outputs to dist/client/
   ↓
3. ESBuild bundles backend
   ├─ Bundles Express server
   ├─ Tree-shakes unused code
   ├─ Minifies code
   └─ Outputs to dist/index.js
   ↓
4. Ready for deployment
```

---

### Vercel Deployment Flow

```
1. git push origin main
   ↓
2. Vercel detects push
   ↓
3. Runs: npm install
   ↓
4. Runs: npm run build (from vercel.json)
   ├─ Creates dist/client/
   └─ Creates dist/index.js
   ↓
5. Deploys dist/client/ to CDN
   ↓
6. Creates serverless function from api/index.js
   ├─ api/index.js imports dist/index.js
   └─ Function handles /api/* routes
   ↓
7. Deployment complete
   ├─ Static files: https://your-app.vercel.app/*
   └─ API routes: https://your-app.vercel.app/api/*
```

---

### Traditional Deployment Flow

```
1. npm run build
   ↓
2. Upload dist/ to server
   ↓
3. npm start (or node dist/index.js)
   ↓
4. Express server runs
   ├─ Serves dist/client/ as static files
   └─ Handles /api/* routes
   ↓
5. Single process serves everything
```

---

## 📁 File Structure Mapping

### Source Files → Build Output

```
Source:                          Build Output:
├── client/                      ├── dist/client/
│   ├── src/                     │   ├── assets/
│   │   ├── components/          │   │   ├── index.css
│   │   ├── pages/               │   │   ├── index.js
│   │   └── ...                  │   │   └── vendor chunks
│   └── index.html               │   ├── index.html
│                                │   └── static assets
├── server/                      │
│   ├── index.ts                 ├── dist/index.js
│   ├── routes.ts                │   (bundled)
│   ├── storage.ts               │
│   └── ...                      │
│                                │
└── api/                         └── api/
    └── index.js                     └── index.js
        (imports dist/index.js)          (unchanged)
```

---

## 🎯 Key Differences: Vercel vs Traditional

| Aspect | Vercel | Traditional (VPS/Docker) |
|--------|--------|--------------------------|
| **Frontend** | CDN (dist/client/) | Express static (dist/client/) |
| **Backend** | Serverless function | Node.js process |
| **Scaling** | Automatic | Manual |
| **Cold starts** | Yes (~100-500ms) | No |
| **Cost** | Pay per invocation | Fixed server cost |
| **Setup** | Automatic | Manual configuration |

---

## ⚙️ Environment Variables

### Required Variables

Must be set in:
- **Local**: `.env` file
- **Vercel**: Dashboard → Settings → Environment Variables

```env
GOOGLE_API_KEY=your_api_key
DATABASE_URL=postgresql://...
NODE_ENV=production
```

### Optional Variables

```env
PORT=5001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EXECUTION_TIMEOUT_MS=300000
```

---

## 🔧 Customization Examples

### Change Build Output Directory

**package.json**:
```json
"build": "vite build && esbuild server/index.ts ... --outfile=build/server.js"
```

**vercel.json**:
```json
"outputDirectory": "build/client"
```

**api/index.js**:
```javascript
import app from '../build/server.js';
```

---

### Add Pre-build Script

**package.json**:
```json
"scripts": {
  "prebuild": "npm run check && npm run validate",
  "build": "vite build && esbuild ..."
}
```

Runs automatically before `npm run build`

---

### Change Serverless Function Timeout

**vercel.json**:
```json
"functions": {
  "api/index.js": {
    "maxDuration": 300  // 5 minutes (Pro plan required)
  }
}
```

---

### Add Multiple Regions

**vercel.json**:
```json
"regions": ["iad1", "sfo1", "fra1"]
```

Deploys to US East, US West, and Europe

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'dist/index.js'"

**Cause**: Build hasn't run or failed

**Fix**:
```bash
npm run build
# Check for errors
ls -la dist/index.js
```

---

### Issue: "Function invocation failed" on Vercel

**Cause**: Environment variables not set

**Fix**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add `GOOGLE_API_KEY` and `DATABASE_URL`
4. Redeploy

---

### Issue: "Build command failed"

**Cause**: TypeScript errors or missing dependencies

**Fix**:
```bash
npm run check  # Check TypeScript
npm install    # Reinstall dependencies
npm run build  # Try build again
```

---

### Issue: API routes return 404 on Vercel

**Cause**: Incorrect rewrite configuration

**Fix**: Verify `vercel.json`:
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  }
]
```

---

## 📚 Related Documentation

- **Build Process**: See [BUILD_GUIDE.md](BUILD_GUIDE.md)
- **Architecture**: See [BUILD_ARCHITECTURE.md](BUILD_ARCHITECTURE.md)
- **Deployment**: See [DEPLOYMENT_FIX.md](DEPLOYMENT_FIX.md)
- **Setup**: See [SETUP.md](SETUP.md)

---

## ✅ Verification Checklist

### Local Development
- [ ] `.env` file configured
- [ ] `npm install` completed
- [ ] `npm run dev` starts without errors
- [ ] Frontend loads at http://localhost:5001
- [ ] API routes work at http://localhost:5001/api/*

### Production Build
- [ ] `npm run build` succeeds
- [ ] `dist/client/` directory exists
- [ ] `dist/index.js` file exists
- [ ] `npm start` runs without errors
- [ ] All features work in production mode

### Vercel Deployment
- [ ] `vercel.json` configured correctly
- [ ] Environment variables set in Vercel Dashboard
- [ ] Build succeeds on Vercel
- [ ] Static files served from CDN
- [ ] API routes work via serverless function
- [ ] Health check returns "healthy"

---

## 🎉 Summary

**package.json**:
- Defines build scripts
- `npm run build` creates production files
- `npm run dev` for local development
- `npm start` for production server

**vercel.json**:
- Configures Vercel deployment
- Points to `dist/client/` for static files
- Routes `/api/*` to serverless function
- Sets function timeout and memory

**Together they**:
- Build optimized production files
- Deploy to Vercel automatically
- Serve frontend from CDN
- Handle API via serverless functions

**Result**: Fast, scalable, production-ready deployment! 🚀
