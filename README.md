# CrewsAI Single

## ⚡ Quickstart

```bash
# 1. Clone the repo
 git clone <repository-url>
 cd Crewsaisingle-main

# 2. Install dependencies
 npm install

# 3. Copy and update env
 cp .env.example .env
# Edit .env with your Gemini API and Postgres info

# 4. Initialize the database
 npm run db:push

# 5. Build & launch
 npm run build && npm start
```

Deploy to **Vercel**:
- Push to GitHub, and [Import in Vercel](https://vercel.com/new)
- Set env variables in Vercel's project dashboard as in `.env`.
- No manual config needed, `vercel.json` already set up.

A modern, production-ready agent orchestration platform that allows users to create, manage, and execute AI agents with defined roles and tasks.

## 🌟 Features

- **Agent Management**: Create, update, delete and reorder agents
- **Task Execution**: Run tasks using Google's Gemini API
- **Responsive UI**: React-based frontend with shadcn/ui components
- **API-First Design**: RESTful API endpoints with validation
- **Database Support**: PostgreSQL database with Drizzle ORM
- **Development Mode**: Hot-reloading for both frontend and backend

## 📋 Requirements

- Node.js 18+
- PostgreSQL database (can be hosted on services like [Neon](https://neon.tech))
- Google API key for Gemini

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd crewsai-single

# Install dependencies
npm install
```

### Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file and add your configuration:
```
# Required configuration
GOOGLE_API_KEY=your_google_api_key_here
DATABASE_URL=your_postgresql_connection_string_here
NODE_ENV=development

# Optional configuration
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5000
LOG_LEVEL=debug
```

### Database Setup

Initialize the database schema:

```bash
npm run db:push
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## 🛠️ Architecture

### Backend

- **Express.js**: API server
- **Drizzle ORM**: Database queries and schema
- **Google Generative AI SDK**: AI model interaction
- **Winston**: Structured logging
- **Zod**: Schema validation

### Frontend

- **React**: UI library
- **Vite**: Build tool
- **TanStack Query**: Data fetching
- **shadcn/ui**: UI components
- **Wouter**: Routing

## 🔒 Security Features

- **Helmet**: Secure HTTP headers
- **CORS**: Configurable origin control
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: All endpoints validate input
- **Error Handling**: Structured error responses

## 🚀 API Endpoints

### Health Check
- `GET /api/health`: System health status

### Agents
- `GET /api/agents`: List all agents
- `GET /api/agents/:id`: Get a specific agent
- `POST /api/agents`: Create a new agent
- `PATCH /api/agents/:id`: Update an agent
- `DELETE /api/agents/:id`: Delete an agent
- `PATCH /api/agents/reorder`: Reorder agents

### Executions
- `POST /api/agents/:id/execute`: Execute an agent's tasks
- `GET /api/executions`: List all executions
- `GET /api/executions/:id`: Get specific execution details

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