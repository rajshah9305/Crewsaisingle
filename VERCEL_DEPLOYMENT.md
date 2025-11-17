# 🚀 Vercel Deployment - Complete Guide

## How Vercel Deployment Works

### File Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  package.json          vercel.json          api/index.js    │
│  ├─ build script       ├─ buildCommand     └─ imports       │
│  └─ dependencies       ├─ outputDirectory      dist/index.js│
│                        └─ rewrites                           │
│                                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ git push
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL BUILD PROCESS                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Install Dependencies                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │ npm install (from vercel.json)                     │    │
│  │ • Installs all dependencies from package.json      │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  Step 2: Run Build Command                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │ npm run build (from vercel.json)                   │    │
│  │                                                     │    │
│  │ ┌─────────────────┐    ┌─────────────────┐       │    │
│  │ │  vite build     │    │  esbuild        │       │    │
│  │ │                 │    │                 │       │    │
│  │ │ Outputs:        │    │ Outputs:        │       │    │
│  │ │ dist/client/    │    │ dist/index.js   │       │    │
│  │ └─────────────────┘    └─────────────────┘       │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  Step 3: Deploy Static Files                                │
│  ┌────────────────────────────────────────────────────┐    │
│  │ dist/client/ → Vercel CDN                          │    │
│  │ • HTML, CSS, JS, images                            │    │
│  │ • Cached globally                                  │    │
│  │ • Fast delivery                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│                           ▼                                  │
│  Step 4: Create Serverless Function                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │ api/index.js → Serverless Function                 │    │
│  │                                                     │    │
│  │ import app from '../dist/index.js';                │    │
│  │ export default app;                                │    │
│  │                                                     │    │
│  │ • Bundles api/index.js + dist/index.js            │    │
│  │ • Creates serverless function                      │    │
│  │ • Handles /api/* routes                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEPLOYED APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Request: https://your-app.vercel.app/                 │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Vercel CDN                                         │    │
│  │ Serves: dist/client/index.html                     │    │
│  │ • Instant delivery                                 │    │
│  │ • Cached globally                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  User Request: https://your-app.vercel.app/api/agents       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Serverless Function (api/index.js)                 │    │
│  │ Runs: dist/index.js (Express app)                  │    │
│  │ • Handles API logic                                │    │
│  │ • Connects to database                             │    │
│  │ • Calls Gemini API                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Configuration Matching

### package.json ↔ vercel.json

```
package.json                    vercel.json
─────────────                   ───────────

"build": "vite build &&    →    "buildCommand": "npm run build"
  esbuild server/..."           (Vercel runs this command)

Output:                         "outputDirectory": "dist/client"
├─ dist/client/            →    (Vercel serves this directory)
└─ dist/index.js           →    (Used by api/index.js)

"start": "node             →    Not used by Vercel
  dist/index.js"                (Only for traditional deployment)
```

---

## File Dependencies

### api/index.js → dist/index.js

```javascript
// api/index.js (Vercel serverless entry point)
import app from '../dist/index.js';  // ← Imports built server
export default app;                   // ← Exports for Vercel

// This file MUST exist for Vercel deployment
// It bridges Vercel's serverless platform with our Express app
```

**Why this file exists**:
- Vercel expects serverless functions in `api/` directory
- Our Express app is built to `dist/index.js`
- `api/index.js` imports and exports the Express app
- Vercel wraps it as a serverless function

---

### vercel.json → api/index.js

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",      // User requests /api/*
      "destination": "/api"        // Routes to api/index.js
    }
  ],
  "functions": {
    "api/index.js": {              // Configure this function
      "maxDuration": 60,           // 60 second timeout
      "memory": 1024,              // 1GB memory
      "runtime": "nodejs20.x"      // Node.js 20
    }
  }
}
```

**How routing works**:
1. User requests: `https://your-app.vercel.app/api/agents`
2. Vercel matches: `/api/(.*)`
3. Routes to: `api/index.js` serverless function
4. Function runs: `dist/index.js` (Express app)
5. Express handles: `/api/agents` route
6. Returns: JSON response

---

## Build Output Verification

### After `npm run build`, you should have:

```
dist/
├── client/                    ← Frontend (for Vercel CDN)
│   ├── assets/
│   │   ├── index-[hash].css
│   │   ├── index-[hash].js
│   │   └── vendor chunks
│   ├── index.html
│   └── static assets
└── index.js                   ← Backend (for api/index.js)
```

### Verify build output:

```bash
# Build the project
npm run build

# Check frontend output
ls -la dist/client/
# Should see: index.html, assets/, favicon, logo

# Check backend output
ls -la dist/index.js
# Should see: index.js (~44KB)

# Verify api/index.js exists
ls -la api/index.js
# Should see: index.js (imports dist/index.js)
```

---

## Deployment Checklist

### Before Deploying to Vercel

- [ ] `package.json` has correct build script
- [ ] `vercel.json` is configured properly
- [ ] `api/index.js` exists and imports `dist/index.js`
- [ ] `npm run build` succeeds locally
- [ ] `dist/client/` directory exists
- [ ] `dist/index.js` file exists
- [ ] Environment variables ready (GOOGLE_API_KEY, DATABASE_URL)

### Vercel Dashboard Setup

1. **Import Project**
   - Connect GitHub repository
   - Vercel auto-detects configuration

2. **Environment Variables**
   - Go to: Settings → Environment Variables
   - Add:
     - `GOOGLE_API_KEY` = Your API key
     - `DATABASE_URL` = Your database URL
     - `NODE_ENV` = `production`
   - Select: Production, Preview, Development

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Test deployment

### After Deployment

- [ ] Visit your Vercel URL
- [ ] Check health endpoint: `/api/health`
- [ ] Test creating an agent
- [ ] Test executing an agent
- [ ] Verify all features work

---

## Common Issues & Solutions

### Issue 1: "Cannot find module '../dist/index.js'"

**Symptom**: Serverless function fails to start

**Cause**: Build didn't create `dist/index.js`

**Solution**:
```bash
# Verify build script in package.json
"build": "vite build && esbuild server/index.ts ... --outfile=dist/index.js"

# Check build output
npm run build
ls -la dist/index.js
```

---

### Issue 2: "Function invocation failed"

**Symptom**: API routes return 500 error

**Cause**: Missing environment variables

**Solution**:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Add all required variables
4. Redeploy

---

### Issue 3: "404 Not Found" for API routes

**Symptom**: `/api/*` routes return 404

**Cause**: Incorrect rewrite configuration

**Solution**: Verify `vercel.json`:
```json
"rewrites": [
  {
    "source": "/api/(.*)",
    "destination": "/api"
  }
]
```

---

### Issue 4: "Build command failed"

**Symptom**: Deployment fails during build

**Cause**: TypeScript errors or missing dependencies

**Solution**:
```bash
# Check TypeScript
npm run check

# Verify dependencies
npm install

# Test build locally
npm run build
```

---

### Issue 5: Static files not loading

**Symptom**: Blank page or 404 for assets

**Cause**: Incorrect output directory

**Solution**: Verify `vercel.json`:
```json
"outputDirectory": "dist/client"
```

And verify `vite.config.ts`:
```typescript
build: {
  outDir: path.resolve(__dirname, "dist/client")
}
```

---

## Testing Deployment Locally

### Simulate Vercel Environment

```bash
# 1. Build the project
npm run build

# 2. Install Vercel CLI
npm install -g vercel

# 3. Run locally
vercel dev

# 4. Test in browser
open http://localhost:3000
```

### Test Production Build

```bash
# 1. Build
npm run build

# 2. Start production server
npm start

# 3. Test
curl http://localhost:5001/api/health
```

---

## Monitoring Deployment

### View Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Click "View Function Logs"

### Check Build Logs

1. Click on deployment
2. View "Build Logs" tab
3. Look for errors or warnings

### Monitor Performance

1. Go to "Analytics" tab
2. View:
   - Response times
   - Error rates
   - Traffic patterns

---

## Optimization Tips

### Reduce Cold Starts

```json
// vercel.json
{
  "functions": {
    "api/index.js": {
      "memory": 1024,        // More memory = faster cold starts
      "maxDuration": 60
    }
  }
}
```

### Enable Caching

```javascript
// server/index.ts
app.use(compression());  // Already enabled
```

### Optimize Bundle Size

```bash
# Analyze bundle
npm run build

# Check sizes
ls -lh dist/client/assets/
```

---

## Rollback Deployment

### If Something Goes Wrong

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

### Or via CLI

```bash
vercel rollback
```

---

## Environment-Specific Configuration

### Development

```json
// vercel.json (for preview deployments)
{
  "env": {
    "NODE_ENV": "development",
    "LOG_LEVEL": "debug"
  }
}
```

### Production

```json
// vercel.json
{
  "env": {
    "NODE_ENV": "production",
    "LOG_LEVEL": "info"
  }
}
```

---

## Summary

### Key Files

1. **package.json** - Defines build process
2. **vercel.json** - Configures Vercel deployment
3. **api/index.js** - Serverless function entry point
4. **dist/index.js** - Built Express server
5. **dist/client/** - Built frontend

### Deployment Flow

```
git push → Vercel Build → Deploy CDN + Serverless → Live!
```

### Configuration Match

- ✅ `package.json` build script creates `dist/`
- ✅ `vercel.json` points to `dist/client/`
- ✅ `api/index.js` imports `dist/index.js`
- ✅ All files work together seamlessly

**Result**: Fast, scalable, production-ready deployment! 🚀
