# 📦 Build and Output Directory Guide

## Build Process Overview

The RAJAI Platform uses a **dual-build system**:
1. **Vite** builds the React frontend
2. **ESBuild** bundles the Express backend

---

## 🏗️ Build Command

```bash
npm run build
```

This runs:
```bash
vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js
```

---

## 📁 Output Directory Structure

After running `npm run build`, the `dist/` directory contains:

```
dist/
├── client/                    # Frontend build (Vite output)
│   ├── assets/               # Bundled JS and CSS files
│   │   ├── index-[hash].css  # Compiled CSS (~63KB, ~11KB gzipped)
│   │   ├── index-[hash].js   # Main bundle (~323KB, ~94KB gzipped)
│   │   ├── react-vendor-[hash].js    # React libraries (~142KB)
│   │   ├── query-vendor-[hash].js    # TanStack Query (~40KB)
│   │   ├── ui-vendor-[hash].js       # UI components (~110KB)
│   │   └── utils-[hash].js           # Utilities (~28KB)
│   ├── favicon.ico           # Favicon
│   ├── favicon.png           # PNG favicon
│   ├── logo.png              # Logo image
│   ├── logo.svg              # SVG logo
│   └── index.html            # Entry HTML file
└── index.js                   # Backend bundle (ESBuild output, ~44KB)
```

---

## 🎯 Directory Purposes

### `dist/client/` - Frontend Static Files

**Purpose**: Contains the compiled React application
**Served by**: Express static middleware in production
**Access**: All files are publicly accessible

**Key Files**:
- `index.html` - Entry point, loads the React app
- `assets/*.js` - JavaScript bundles (code-split for performance)
- `assets/*.css` - Compiled Tailwind CSS
- `*.png`, `*.svg` - Static assets (logos, favicons)

**Code Splitting**:
- `react-vendor.js` - React core libraries
- `query-vendor.js` - TanStack Query
- `ui-vendor.js` - UI components (Radix UI, Lucide icons)
- `utils.js` - Utility libraries (date-fns, wouter)
- `index.js` - Application code

### `dist/index.js` - Backend Server Bundle

**Purpose**: Bundled Express server with all dependencies
**Executed by**: Node.js in production
**Contains**: 
- Express server
- API routes
- Database logic
- Gemini AI integration
- All server-side code

---

## ⚙️ Build Configuration

### Vite Configuration (`vite.config.ts`)

```typescript
{
  root: "client",                    // Source directory
  build: {
    outDir: "../dist/client",        // Output directory
    emptyOutDir: true,               // Clean before build
    chunkSizeWarningLimit: 1000,     // Warn if chunks > 1MB
    rollupOptions: {
      output: {
        manualChunks: {              // Code splitting strategy
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', '@hello-pangea/dnd'],
          'utils': ['date-fns', 'wouter'],
        }
      }
    }
  }
}
```

### ESBuild Configuration (in package.json)

```bash
esbuild server/index.ts \
  --platform=node \           # Target Node.js
  --packages=external \       # Don't bundle node_modules
  --bundle \                  # Bundle all imports
  --format=esm \              # ES modules format
  --outfile=dist/index.js     # Output file
```

---

## 🚀 Deployment Configurations

### Vercel (`vercel.json`)

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": "dist/client",    // Serves frontend
  "rewrites": [
    {
      "source": "/api/(.*)",           // API routes
      "destination": "/api"            // Handled by serverless function
    }
  ],
  "functions": {
    "api/index.js": {                  // Serverless function config
      "maxDuration": 60                // 60 second timeout
    }
  }
}
```

**How Vercel Works**:
1. Builds the project with `npm run build`
2. Serves `dist/client/` as static files
3. Routes `/api/*` requests to serverless function
4. Serverless function runs `dist/index.js`

### Traditional Deployment (VPS, Docker, etc.)

```bash
# Build
npm run build

# Start production server
NODE_ENV=production node dist/index.js
```

**How it Works**:
1. `dist/index.js` starts Express server
2. Express serves `dist/client/` as static files
3. Express handles `/api/*` routes
4. Single process serves both frontend and backend

---

## 📊 Build Output Analysis

### Typical Build Output

```
vite v5.4.21 building for production...
transforming...
✓ 2166 modules transformed.
rendering chunks...
computing gzip size...

dist/client/index.html                    1.38 kB │ gzip:  0.64 kB
dist/client/assets/index-[hash].css      63.01 kB │ gzip: 10.90 kB
dist/client/assets/utils-[hash].js       27.66 kB │ gzip:  8.80 kB
dist/client/assets/query-vendor-[hash].js 40.40 kB │ gzip: 12.02 kB
dist/client/assets/ui-vendor-[hash].js   110.14 kB │ gzip: 33.36 kB
dist/client/assets/react-vendor-[hash].js 142.17 kB │ gzip: 45.56 kB
dist/client/assets/index-[hash].js       322.72 kB │ gzip: 94.08 kB
✓ built in 6.76s

dist/index.js  44.4kb
⚡ Done in 15ms
```

### Bundle Size Breakdown

| File | Size | Gzipped | Purpose |
|------|------|---------|---------|
| index.html | 1.38 KB | 0.64 KB | Entry HTML |
| index.css | 63.01 KB | 10.90 KB | Tailwind CSS |
| react-vendor.js | 142.17 KB | 45.56 KB | React core |
| ui-vendor.js | 110.14 KB | 33.36 KB | UI components |
| query-vendor.js | 40.40 KB | 12.02 KB | TanStack Query |
| utils.js | 27.66 kB | 8.80 KB | Utilities |
| index.js (client) | 322.72 KB | 94.08 KB | App code |
| **Total Client** | **707 KB** | **205 KB** | Frontend |
| index.js (server) | 44.4 KB | N/A | Backend |
| **Grand Total** | **751 KB** | **205 KB** | Full app |

**Performance Rating**: ⭐⭐⭐⭐⭐ Excellent

---

## 🔍 Inspecting Build Output

### View Build Files

```bash
# List all build files
ls -lh dist/
ls -lh dist/client/
ls -lh dist/client/assets/

# Check file sizes
du -sh dist/
du -sh dist/client/
du -sh dist/index.js
```

### Analyze Bundle Size

```bash
# Install bundle analyzer
npm install --save-dev vite-bundle-visualizer

# Add to vite.config.ts
import { visualizer } from 'vite-bundle-visualizer';

plugins: [
  react(),
  visualizer({ open: true })
]

# Build and view analysis
npm run build
```

### Test Production Build Locally

```bash
# Build the application
npm run build

# Start production server
NODE_ENV=production node dist/index.js

# Test in browser
open http://localhost:5001
```

---

## 🛠️ Build Optimization

### Current Optimizations

✅ **Code Splitting** - Separate vendor bundles
✅ **Tree Shaking** - Remove unused code
✅ **Minification** - Compress JavaScript and CSS
✅ **Gzip Compression** - Server-side compression
✅ **Asset Hashing** - Cache busting with content hashes
✅ **Lazy Loading** - Components loaded on demand

### Further Optimization Options

```typescript
// vite.config.ts
build: {
  // Reduce chunk size warning threshold
  chunkSizeWarningLimit: 500,
  
  // More aggressive code splitting
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          // Split each major library into its own chunk
          if (id.includes('react')) return 'react';
          if (id.includes('@tanstack')) return 'tanstack';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('lucide')) return 'lucide';
          return 'vendor';
        }
      }
    }
  },
  
  // Enable source maps for debugging (optional)
  sourcemap: false,
  
  // Minification options
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,  // Remove console.log in production
      drop_debugger: true
    }
  }
}
```

---

## 🐛 Troubleshooting Build Issues

### Issue: "Build failed" or "Module not found"

**Cause**: Missing dependencies or incorrect imports

**Fix**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue: "Out of memory" during build

**Cause**: Large bundle or insufficient memory

**Fix**:
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Issue: "dist/ directory not found"

**Cause**: Build hasn't been run yet

**Fix**:
```bash
npm run build
```

### Issue: "Assets not loading in production"

**Cause**: Incorrect base path or static file serving

**Fix**: Check `server/vite.ts` static file serving:
```typescript
app.use(express.static(path.resolve(process.cwd(), 'dist/client')));
```

---

## 📝 Build Scripts Explained

### Development (`npm run dev`)

```bash
node scripts/validate-env.cjs &&    # Validate environment
node scripts/validate-deps.cjs &&   # Validate dependencies
NODE_ENV=development tsx server/index.ts  # Start dev server
```

**What happens**:
- Validates configuration
- Starts server with hot reload (tsx)
- Vite dev server serves frontend with HMR
- No build required

### Production Build (`npm run build`)

```bash
vite build &&                       # Build frontend
esbuild server/index.ts ...         # Bundle backend
```

**What happens**:
- Compiles React app to `dist/client/`
- Bundles server to `dist/index.js`
- Optimizes and minifies all code
- Generates production-ready files

### Production Start (`npm start`)

```bash
NODE_ENV=production node dist/index.js
```

**What happens**:
- Runs bundled server
- Serves static files from `dist/client/`
- Handles API routes
- No hot reload or dev tools

---

## 🎯 Best Practices

### For Development

1. **Don't commit `dist/`** - It's in `.gitignore`
2. **Use `npm run dev`** - Faster with hot reload
3. **Check TypeScript** - Run `npm run check` before building
4. **Test locally** - Build and test before deploying

### For Production

1. **Always build fresh** - Don't reuse old builds
2. **Set NODE_ENV=production** - Enables optimizations
3. **Test the build** - Run `npm start` locally first
4. **Monitor bundle size** - Keep under 1MB total
5. **Use CDN** - For static assets in production (optional)

### For Deployment

1. **Vercel**: Automatically builds on push
2. **Docker**: Include build step in Dockerfile
3. **VPS**: Build on server or upload pre-built files
4. **CI/CD**: Build in pipeline, deploy artifacts

---

## 📚 Related Documentation

- **Vite Build Guide**: https://vitejs.dev/guide/build.html
- **ESBuild Documentation**: https://esbuild.github.io/
- **Vercel Deployment**: https://vercel.com/docs
- **Performance Optimization**: See `RESPONSIVE_DESIGN.md`

---

## 🔗 Quick Reference

```bash
# Development
npm run dev              # Start dev server (no build)

# Production
npm run build            # Build for production
npm start                # Start production server
npm run check            # TypeScript type check

# Validation
npm run validate         # Validate environment
./scripts/diagnose.sh    # Full diagnostic

# Deployment
git push origin main     # Auto-deploy on Vercel
```

---

**Summary**: The build process creates optimized, production-ready files in `dist/` with the frontend in `dist/client/` and backend in `dist/index.js`. Total bundle size is ~205KB gzipped, which is excellent for a full-stack application.
