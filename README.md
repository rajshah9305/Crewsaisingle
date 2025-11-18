# 🤖 RAJAI Platform

<div align="center">

**Enterprise-Grade AI Agent Orchestration Platform**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rajshah9305/Crewsaisingle)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Create, manage, and execute intelligent AI agents powered by **Google Gemini 2.5 Flash**

[Features](#-features) • [Quick Start](#-quick-start) • [Deploy](#-deployment) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### 🎯 Core Capabilities

- **🤖 AI-Powered Agents** - Create intelligent agents with custom roles, goals, and tasks
- **⚡ Lightning Fast Execution** - Asynchronous task processing with real-time tracking
- **📊 Execution Monitoring** - Comprehensive dashboard with performance metrics
- **🎨 Agent Templates** - Pre-configured templates for common use cases
- **🔄 Drag & Drop Reordering** - Intuitive agent management interface
- **📈 Real-time Analytics** - Track success rates, execution times, and performance

### 🛡️ Enterprise Security

- **🔒 Rate Limiting** - API abuse prevention (100 requests per 15 minutes)
- **🌐 CORS Protection** - Configurable cross-origin resource sharing
- **✅ Input Validation** - Comprehensive Zod schema validation
- **🔐 Secure Headers** - Helmet.js for HTTP security
- **📝 Structured Logging** - Winston-based logging with environment-specific configs
- **⏱️ Request Timeouts** - Automatic timeout handling (30s default)

### 🏗️ Technical Excellence

- **💯 TypeScript** - 100% type-safe codebase with zero compilation errors
- **🎨 Modern UI** - Beautiful React interface with shadcn/ui components
- **🗄️ PostgreSQL** - Reliable data persistence with Drizzle ORM
- **☁️ Serverless Ready** - Optimized for Vercel deployment
- **🔄 Error Recovery** - Comprehensive error boundaries and graceful degradation
- **📦 Connection Pooling** - Efficient database resource management

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **PostgreSQL** database ([Neon](https://neon.tech) recommended)
- **Google Gemini API Key** from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials
```

### Configuration

Create a `.env` file:

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
# Start development server
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

---

## 📦 Deployment

### Vercel (Recommended)

1. **Fork & Import**
   - Fork this repository to your GitHub account
   - Import to [Vercel](https://vercel.com/new)

2. **Configure Environment Variables**
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically build and deploy

4. **Initialize Database**
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

**💡 Tip:** Use [Neon](https://neon.tech) for managed PostgreSQL with Vercel integration.

See [VERCEL_SETUP.md](VERCEL_SETUP.md) for detailed deployment instructions.

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Vite for fast builds
- TanStack Query for data synchronization
- shadcn/ui component library
- Tailwind CSS for styling
- Wouter for routing

**Backend**
- Node.js 18+ with Express.js
- TypeScript for type safety
- Drizzle ORM for database operations
- Google Gemini 2.5 Flash API
- Winston for structured logging
- Zod for runtime validation

**Infrastructure**
- Vercel for serverless deployment
- PostgreSQL for data persistence
- ESBuild for optimized bundling

### Project Structure

```
Crewsaisingle/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and query client
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── utils/              # Server utilities
│   ├── config.ts           # Configuration management
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   └── gemini.ts           # Gemini API integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema and validation
└── scripts/                # Build and validation scripts
```

---

## 📚 Documentation

- **[VERCEL_SETUP.md](VERCEL_SETUP.md)** - Detailed deployment guide
- **[TEST_RESULTS.md](TEST_RESULTS.md)** - Comprehensive test documentation

---

## 🎯 Use Cases

- **Content Creation** - Generate blog posts, articles, and marketing copy
- **Code Review** - Automated code analysis and optimization suggestions
- **Data Analysis** - Process and analyze datasets with AI insights
- **Customer Support** - Automated response generation and ticket handling
- **Report Generation** - Create comprehensive reports from raw data
- **Task Automation** - Automate repetitive workflows and processes

---

## 🔧 API Reference

### Health Check

```http
GET /api/health
```

Returns system health status including database connectivity and API configuration.

### Agent Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents |
| `/api/agents/:id` | GET | Get agent by ID |
| `/api/agents` | POST | Create new agent |
| `/api/agents/:id` | PATCH | Update agent |
| `/api/agents/:id` | DELETE | Delete agent |
| `/api/agents/reorder` | PATCH | Reorder agents |

### Execution Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/:id/execute` | POST | Execute agent tasks |
| `/api/executions` | GET | List executions |
| `/api/executions/:id` | GET | Get execution details |

---

## 🎨 Screenshots

### Landing Page
Beautiful, modern landing page with feature highlights and call-to-action.

### Dashboard
Comprehensive dashboard with real-time metrics and agent management.

### Agent Creation
Intuitive interface for creating and configuring AI agents.

### Execution Tracking
Real-time monitoring of agent executions with detailed results.

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add proper TypeScript types for all functions
- Run `npm run check` before committing
- Update documentation for new features
- Add tests for new functionality

---

## 📊 Performance

- **Build Time**: ~6 seconds
- **Agent Creation**: ~16ms response time
- **Agent Execution**: 30-60s (depends on task complexity)
- **Database Queries**: 4-6ms average
- **Bundle Size**: 706KB (client), 47KB (server)

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify `DATABASE_URL` is correct
- Ensure database is accessible
- For cloud databases, check SSL configuration

**API Key Issues**
- Confirm `GOOGLE_API_KEY` is valid
- Check quota limits in Google AI Studio
- Ensure key is set in Vercel environment variables

**Build Failures**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Ensure Node.js 18+ is installed

See [VERCEL_SETUP.md](VERCEL_SETUP.md) for detailed troubleshooting.

---

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `development` | No |
| `PORT` | Server port | `5000` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | - | Yes |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000,http://localhost:5000` | No |
| `LOG_LEVEL` | Logging level | `info` | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window (ms) | `900000` | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | No |
| `EXECUTION_TIMEOUT_MS` | Agent execution timeout (ms) | `300000` | No |

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with modern web technologies and powered by Google Gemini AI. Special thanks to the open-source community for the excellent tools and libraries that make this platform possible.

---

<div align="center">

**Made with ❤️ by the RAJAI Team**

[⭐ Star us on GitHub](https://github.com/rajshah9305/Crewsaisingle) • [🐛 Report Bug](https://github.com/rajshah9305/Crewsaisingle/issues) • [✨ Request Feature](https://github.com/rajshah9305/Crewsaisingle/issues)

</div>
