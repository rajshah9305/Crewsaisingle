# RAJAI Platform

Enterprise-grade AI agent orchestration platform powered by Google Gemini 2.5 Flash. Create, manage, and execute intelligent agents with defined roles and tasks through a modern web interface.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Crewsaisingle)

## 🚀 Quick Deploy to Vercel

1. Click the "Deploy with Vercel" button above
2. Set environment variables in Vercel dashboard:
   - `GOOGLE_API_KEY` - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `DATABASE_URL` - PostgreSQL connection string (recommend [Neon](https://neon.tech))
   - `NODE_ENV=production`
3. Deploy the application
4. **Important:** Initialize the database schema (see below)

### Initialize Database After Deployment

After deploying to Vercel, you need to create the database tables:

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables
vercel env pull .env.local

# Initialize database schema
npm run db:push
```

**See [VERCEL_SETUP.md](VERCEL_SETUP.md) for detailed instructions and troubleshooting.**

## Features

- **Agent Management** - Full CRUD operations for AI agents with drag-and-drop reordering
- **Task Execution** - Asynchronous execution using Google Gemini 2.5 Flash API
- **Execution Tracking** - Real-time monitoring of agent performance and results
- **Agent Templates** - Pre-configured templates for common use cases
- **Modern UI** - Responsive React interface built with shadcn/ui components
- **Enterprise Security** - Helmet.js, CORS, rate limiting, and comprehensive input validation
- **Database Persistence** - PostgreSQL with Drizzle ORM for reliable data storage
- **Structured Logging** - Winston-based logging with environment-specific configurations
- **Error Handling** - Comprehensive error boundaries and graceful error recovery

## Technology Stack

### Backend
- Node.js 18+ with Express.js
- TypeScript for type safety
- Drizzle ORM for database operations
- PostgreSQL database
- Google Gemini 2.5 Flash API
- Winston for structured logging
- Zod for runtime validation

### Frontend
- React 18 with TypeScript
- Vite for fast builds
- TanStack Query for data synchronization
- shadcn/ui component library
- Tailwind CSS for styling
- Wouter for routing

### Infrastructure
- Vercel for serverless deployment
- ESBuild for optimized bundling

## Prerequisites

- Node.js 18 or higher
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle

# Install dependencies
npm install
```

### Configuration

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
EXECUTION_TIMEOUT_MS=300000
```

### Database Setup

```bash
# Initialize database schema
npm run db:push

# Verify configuration
npm run validate
```

### Development

```bash
# Start development server with hot-reload
npm run dev

# Application available at http://localhost:5001
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel (Recommended)

1. Fork this repository to your GitHub account
2. Import the project to [Vercel](https://vercel.com/new)
3. Configure environment variables in Vercel dashboard:
   - `GOOGLE_API_KEY` - Your Google Gemini API key
   - `DATABASE_URL` - PostgreSQL connection string
   - `NODE_ENV` - Set to `production`
4. Deploy - Vercel will automatically build and deploy
5. **Initialize database schema** - See [VERCEL_SETUP.md](VERCEL_SETUP.md)

**Recommended**: Use [Neon](https://neon.tech) for managed PostgreSQL hosting with Vercel integration.

## Common Issues

### "Function Invocation Failed" When Creating Agents

This error occurs when the database schema hasn't been initialized. Follow these steps:

1. Install Vercel CLI: `npm install -g vercel`
2. Link your project: `vercel link`
3. Pull environment variables: `vercel env pull .env.local`
4. Initialize database: `npm run db:push`

See [VERCEL_SETUP.md](VERCEL_SETUP.md) for detailed troubleshooting.

### Database Connection Errors

- Verify your `DATABASE_URL` is correct
- Ensure your database is running and accessible
- For cloud databases, check if SSL is required (add `?sslmode=require`)

### API Key Issues

- Confirm your `GOOGLE_API_KEY` is valid
- Check quota limits in Google AI Studio
- Ensure the key is set in Vercel environment variables

## Project Structure

```
Crewsaisingle/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (Dashboard, Agents, Executions, Templates)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and query client
│   │   └── App.tsx         # Main application component
│   └── index.html
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── utils/              # Server utilities (logger, validation)
│   ├── config.ts           # Configuration management
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── gemini.ts           # Gemini API integration
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and Zod validation
├── scripts/                # Build and validation scripts
├── drizzle.config.ts       # Database configuration
├── vite.config.ts          # Vite build configuration
├── vercel.json             # Vercel deployment configuration
└── package.json            # Dependencies and scripts
```

## API Reference

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

#### Get Agent by ID
```http
GET /api/agents/:id
```

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
```

#### Delete Agent
```http
DELETE /api/agents/:id
```

#### Reorder Agents
```http
PATCH /api/agents/reorder
```

### Execution Management

#### Execute Agent
```http
POST /api/agents/:id/execute
```

#### List Executions
```http
GET /api/executions?limit=10
```

#### Get Execution Details
```http
GET /api/executions/:id
```

## Security Features

- **Helmet.js** - Secure HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - API abuse prevention (100 requests per 15 minutes)
- **Input Validation** - Zod schema validation on all endpoints
- **Error Handling** - Structured error responses with logging
- **Request Timeouts** - 30-second timeout to prevent hanging requests
- **Connection Pooling** - Efficient database connection management
- **Graceful Shutdown** - Proper cleanup on process termination

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | - | Yes |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost:3000,http://localhost:5000` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window (ms) | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `ENABLE_RESPONSE_CACHE` | Enable API response caching | `false` | No |
| `CACHE_TTL_SECONDS` | Cache TTL (seconds) | `300` | No |
| `EXECUTION_TIMEOUT_MS` | Agent execution timeout (ms) | `300000` | No |

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run check` | Type-check TypeScript code |
| `npm run db:push` | Push database schema to PostgreSQL |
| `npm run validate` | Validate environment and dependencies |
| `npm test` | Run validation tests |

## Documentation

- **[VERCEL_SETUP.md](VERCEL_SETUP.md)** - Detailed Vercel deployment and troubleshooting guide

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/rajshah9305/Crewsaisingle).
