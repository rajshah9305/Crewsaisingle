# 🤖 RAJAI Platform - Multi-Agent Orchestration System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/rajai-platform)

> A modern, production-ready AI agent orchestration platform powered by Google's Gemini API. Create, manage, and execute intelligent agents with defined roles and tasks through an intuitive, visually stunning interface.

## ✨ Features

- 🎯 **Intelligent Agent Management** - Create, update, delete, and reorder AI agents
- ⚡ **Real-time Task Execution** - Execute tasks using Google's Gemini 2.5 Flash API
- 🎨 **Modern UI/UX** - Responsive React interface with shadcn/ui components
- 🔒 **Enterprise Security** - Helmet, CORS, rate limiting, and input validation
- 📊 **Execution Tracking** - Monitor agent performance and results in real-time
- 🗄️ **PostgreSQL Database** - Reliable data persistence with Drizzle ORM
- 🚀 **One-Click Deploy** - Deploy to Vercel with zero configuration

## ⚡ Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/rajai-platform.git
cd rajai-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your credentials:
# - GOOGLE_API_KEY: Get from https://makersuite.google.com/app/apikey
# - DATABASE_URL: PostgreSQL connection string (try https://neon.tech for free hosting)

# 4. Initialize the database
npm run db:push

# 5. Start development server
npm run dev
# Open http://localhost:5001

# For production:
npm run build && npm start
```

## 🚀 Deploy to Vercel (Recommended)

1. **Fork this repository** to your GitHub account
2. **Import to Vercel**: Click the "Deploy with Vercel" button above or visit [vercel.com/new](https://vercel.com/new)
3. **Configure Environment Variables** in Vercel dashboard:
   - `GOOGLE_API_KEY` - Your Google Gemini API key
   - `DATABASE_URL` - PostgreSQL connection string
   - `NODE_ENV` - Set to `production`
4. **Deploy** - Vercel will automatically build and deploy your app

> 💡 **Tip**: Use [Neon](https://neon.tech) for free PostgreSQL hosting with Vercel integration

## 💻 Tech Stack

### Backend
- **Node.js** + **Express.js** - Fast, minimal web framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Lightweight, type-safe database toolkit
- **PostgreSQL** - Reliable relational database
- **Google Gemini 2.5 Flash** - Advanced AI model
- **Winston** - Professional logging
- **Zod** - Runtime type validation

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **TanStack Query** - Powerful data synchronization
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Wouter** - Lightweight routing

### DevOps
- **Vercel** - Serverless deployment platform
- **GitHub Actions** - CI/CD automation
- **ESBuild** - Ultra-fast bundler

## 📦 Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL Database** - Free tier available at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- **Google Gemini API Key** - Get yours at [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🛠️ Local Development

### 1. Environment Setup

Create a `.env` file in the project root:

```env
# Required
GOOGLE_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=development

# Optional (with defaults)
PORT=5001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001
LOG_LEVEL=debug
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Database Migration

```bash
# Push schema to database
npm run db:push

# Verify connection
npm run validate
```

### 3. Development Server

```bash
# Start with hot-reload
npm run dev

# The app will be available at:
# http://localhost:5001
```

### 4. Production Build

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## 🏛️ Project Structure

```
rajai-platform/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and helpers
│   │   └── App.tsx          # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── utils/           # Server utilities
│   ├── config.ts        # Configuration management
│   ├── routes.ts        # API route definitions
│   ├── storage.ts       # Database operations
│   ├── gemini.ts        # AI integration
│   └── index.ts         # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts        # Database schema & Zod validation
├── scripts/               # Build and validation scripts
├── .env.example           # Environment template
├── drizzle.config.ts      # Database configuration
├── vite.config.ts         # Vite build configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies and scripts
```

## 🔒 Security & Best Practices

- ✅ **Helmet.js** - Secure HTTP headers
- ✅ **CORS** - Configurable cross-origin requests
- ✅ **Rate Limiting** - Prevent API abuse (100 req/15min)
- ✅ **Input Validation** - Zod schema validation on all endpoints
- ✅ **Error Handling** - Structured error responses with logging
- ✅ **Request Timeouts** - 30s timeout to prevent hanging requests
- ✅ **Connection Pooling** - Efficient database connection management
- ✅ **Graceful Shutdown** - Proper cleanup on process termination

## 🔌 API Reference

### Health Check
```http
GET /api/health
```
Returns system health status including database connectivity and API configuration.

### Agent Management

#### List All Agents
```http
GET /api/agents
```
Returns array of all agents ordered by their position.

#### Get Single Agent
```http
GET /api/agents/:id
```
Returns detailed information about a specific agent.

#### Create Agent
```http
POST /api/agents
Content-Type: application/json

{
  "name": "Content Writer",
  "role": "Senior Content Strategist",
  "goal": "Create engaging, SEO-optimized content",
  "backstory": "Expert writer with 10 years of experience",
  "tasks": [
    "Research trending topics",
    "Write 1000-word article",
    "Optimize for SEO"
  ]
}
```

#### Update Agent
```http
PATCH /api/agents/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "role": "Updated Role",
  ...
}
```

#### Delete Agent
```http
DELETE /api/agents/:id
```

#### Reorder Agents
```http
PATCH /api/agents/reorder
Content-Type: application/json

{
  "agents": [
    { "id": "agent-1", "order": 0 },
    { "id": "agent-2", "order": 1 }
  ]
}
```

### Execution Management

#### Execute Agent
```http
POST /api/agents/:id/execute
```
Starts asynchronous execution of agent tasks. Returns 202 Accepted with execution ID.

#### List Executions
```http
GET /api/executions?limit=10
```
Returns array of executions ordered by creation date (newest first).

#### Get Execution Details
```http
GET /api/executions/:id
```
Returns detailed execution information including status and results.

## 🧪 Testing

Run tests:
```bash
npm test
```

## 📊 Monitoring

The application includes comprehensive logging with Winston:

- Console logs in development
- Structured JSON logs in production
- Error tracking with stack traces

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development, test, production) | development |
| `PORT` | Server port | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | (required) |
| `GOOGLE_API_KEY` | Google API key for Gemini | (required) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | http://localhost:3000,http://localhost:5000 |
| `LOG_LEVEL` | Logging level | info |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window in ms | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ENABLE_RESPONSE_CACHE` | Enable API response caching | false |
| `CACHE_TTL_SECONDS` | Cache TTL in seconds | 300 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## 📝 License

MIT