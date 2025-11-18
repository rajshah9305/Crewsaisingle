# RAJAI Platform

Enterprise-grade AI agent orchestration platform powered by Google Gemini 2.5 Flash. Create, manage, and execute intelligent agents with defined roles and tasks through a modern web interface.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Crewsaisingle)

## 🎉 Latest Updates (v1.1.0)

**All TypeScript errors have been fixed!** This release includes comprehensive bug fixes, improved type safety, and enhanced documentation.

### What's New
- ✅ **26 TypeScript errors resolved** - Clean compilation with zero errors
- ✅ **Improved type safety** - All API requests now properly typed
- ✅ **Enhanced error handling** - Better null checks and error messages
- ✅ **Security updates** - Fixed high severity vulnerability
- ✅ **Comprehensive documentation** - New setup guide and troubleshooting

See [CHANGELOG.md](CHANGELOG.md) for detailed changes and [FIXES_APPLIED.md](FIXES_APPLIED.md) for technical details.

## Features

The RAJAI Platform provides a complete solution for managing and executing AI agents with the following capabilities:

**Agent Management** enables full CRUD operations for AI agents with an intuitive drag-and-drop interface for reordering. Users can create agents with specific roles, goals, backstories, and task lists, providing fine-grained control over agent behavior and execution order.

**Task Execution** leverages the Google Gemini 2.5 Flash API for asynchronous task processing. The platform handles background execution with proper timeout management, error recovery, and result validation, ensuring reliable operation even with complex or long-running tasks.

**Execution Tracking** offers real-time monitoring of agent performance through a comprehensive dashboard. Users can view execution history, track running tasks, monitor completion status, and access detailed results for each execution, providing full visibility into agent operations.

**Agent Templates** accelerate development with pre-configured templates for common use cases. These templates include content writing, research analysis, code review, and data processing scenarios, allowing users to quickly deploy agents for standard workflows.

**Modern UI** delivers a responsive React interface built with shadcn/ui components. The design features a clean, professional aesthetic with smooth animations, mobile-responsive layouts, and an intuitive user experience that makes agent management accessible to both technical and non-technical users.

**Enterprise Security** implements industry-standard security practices including Helmet.js for secure HTTP headers, configurable CORS policies, rate limiting to prevent abuse, and comprehensive input validation using Zod schemas to ensure data integrity.

**Database Persistence** utilizes PostgreSQL with Drizzle ORM for reliable data storage. The platform includes connection pooling for efficient resource usage, automatic retry logic for transient failures, and health check endpoints for monitoring database connectivity.

**Structured Logging** employs Winston-based logging with environment-specific configurations. Development environments receive pretty-printed console logs with debug information, while production environments generate structured JSON logs suitable for log aggregation systems.

**Error Handling** provides comprehensive error boundaries and graceful error recovery throughout the application. The platform includes detailed error messages for debugging, automatic cleanup of stuck executions, and proper timeout handling to maintain system stability.

## Technology Stack

### Backend
The server architecture is built on Node.js 18+ with Express.js, providing a robust foundation for API endpoints and business logic. TypeScript ensures type safety throughout the codebase, while Drizzle ORM manages database operations with PostgreSQL. The Google Gemini 2.5 Flash API powers the AI agent execution, and Winston handles structured logging across all components. Zod provides runtime validation for all API inputs and outputs.

### Frontend
The client application uses React 18 with TypeScript for a type-safe development experience. Vite enables fast builds and hot module replacement during development. TanStack Query manages data synchronization and caching, while the shadcn/ui component library built on Radix UI provides accessible, customizable components. Tailwind CSS handles styling with a utility-first approach, and Wouter provides lightweight client-side routing.

### Infrastructure
The platform is optimized for Vercel serverless deployment, with ESBuild handling optimized bundling for both client and server code. The architecture supports both traditional Node.js deployments and modern serverless environments.

## Prerequisites

Before getting started, ensure you have the following:

- **Node.js 18 or higher** installed on your system
- **PostgreSQL database** (Neon, Supabase, or self-hosted)
- **Google Gemini API key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Quick Start

### Installation

Begin by cloning the repository and installing dependencies:

```bash
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle
npm install
```

### Configuration

Create a `.env` file in the project root with your credentials:

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

For detailed configuration instructions, see [SETUP.md](SETUP.md).

### Database Setup

Initialize the database schema:

```bash
npm run db:push
npm run validate
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:5001

### Production Build

Build and start the production server:

```bash
npm run build
npm start
```

## Deployment

### Vercel Deployment

The platform is optimized for Vercel deployment. Follow these steps:

First, fork the repository to your GitHub account. Then import the project to Vercel and configure the required environment variables in the Vercel dashboard: `GOOGLE_API_KEY`, `DATABASE_URL`, and `NODE_ENV` (set to production). Vercel will automatically build and deploy your application.

After deployment, initialize the database schema by installing the Vercel CLI, linking to your project, pulling environment variables, and running the database migration:

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
npm run db:push
```

For detailed deployment instructions and alternative platforms, see [SETUP.md](SETUP.md).

## Project Structure

The codebase is organized into distinct layers for maintainability:

The **client** directory contains the frontend React application, including reusable UI components, route pages for different views, custom React hooks for shared logic, and utility functions for API communication.

The **server** directory houses the backend Express application with business logic services, configuration management, API route definitions, database operations through Drizzle ORM, and Gemini API integration.

The **shared** directory contains types and schemas used by both client and server, ensuring consistency across the full stack.

The **scripts** directory includes build and validation utilities for development and deployment workflows.

## API Reference

### Health Check

The health check endpoint provides system status information:

```http
GET /api/health
```

Returns database connectivity status, API configuration, and environment information.

### Agent Management

The agent management API supports full CRUD operations. List all agents with `GET /api/agents`, retrieve a specific agent with `GET /api/agents/:id`, create new agents with `POST /api/agents`, update existing agents with `PATCH /api/agents/:id`, delete agents with `DELETE /api/agents/:id`, and reorder agents with `PATCH /api/agents/reorder`.

### Execution Management

Execute agent tasks asynchronously with `POST /api/agents/:id/execute`, which returns a 202 Accepted status with an execution ID. List all executions with `GET /api/executions` (supports optional limit parameter), and retrieve detailed execution information including status and results with `GET /api/executions/:id`.

For complete API documentation with request/response examples, see the original [README.md](README.md).

## Security Features

The platform implements multiple layers of security:

**Helmet.js** secures HTTP headers to prevent common web vulnerabilities. **CORS** provides configurable cross-origin resource sharing policies. **Rate Limiting** prevents API abuse with 100 requests per 15 minutes per IP address. **Input Validation** uses Zod schema validation on all endpoints to ensure data integrity. **Error Handling** provides structured error responses with appropriate logging while hiding sensitive details in production. **Request Timeouts** enforce a 30-second timeout to prevent hanging requests. **Connection Pooling** manages database connections efficiently to prevent resource exhaustion. **Graceful Shutdown** ensures proper cleanup on process termination.

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

## Troubleshooting

### Common Issues

**Database Connection Errors**: Verify your `DATABASE_URL` is correct and the database is accessible. For cloud databases, ensure your IP is whitelisted and SSL is properly configured.

**API Key Issues**: Confirm your `GOOGLE_API_KEY` is valid and has not exceeded quota limits. Check the Google AI Studio console for API usage and limits.

**Build Failures**: Delete `node_modules` and `package-lock.json`, then run `npm install` again. Ensure you're using Node.js 18 or higher.

**TypeScript Errors**: This version has all TypeScript errors fixed. If you encounter new errors after modifications, run `npm run check` for detailed diagnostics.

For more troubleshooting help, see [SETUP.md](SETUP.md).

## Documentation

- **[SETUP.md](SETUP.md)** - Comprehensive setup and deployment guide
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and upgrade guide
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)** - Technical details of bug fixes
- **[ANALYSIS.md](ANALYSIS.md)** - Codebase analysis and architecture

## Contributing

Contributions are welcome! When contributing:

- Follow the existing code style and TypeScript conventions
- Add proper types for all functions and components
- Run `npm run check` before committing to ensure type safety
- Update documentation for new features or changes
- Add tests for new functionality

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/rajshah9305/Crewsaisingle).

## Acknowledgments

Built with modern web technologies and powered by Google Gemini AI. Special thanks to the open-source community for the excellent tools and libraries that make this platform possible.
