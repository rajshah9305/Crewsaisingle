# RAJAI Platform - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18 or higher** - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **PostgreSQL database** (see options below)
- **Google Gemini API key** (see instructions below)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/rajshah9305/Crewsaisingle.git
cd Crewsaisingle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit the `.env` file and configure the following required variables:

#### Required Configuration

##### GOOGLE_API_KEY

Get your Google Gemini API key:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Paste it in your `.env` file:

```env
GOOGLE_API_KEY=AIzaSy...your_actual_key_here
```

##### DATABASE_URL

You have several options for PostgreSQL:

**Option 1: Neon (Recommended for Vercel)**
1. Visit [Neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy the connection string
5. Paste it in your `.env` file:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Option 2: Supabase**
1. Visit [Supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" (URI format)
5. Paste it in your `.env` file

**Option 3: Local PostgreSQL**
1. Install PostgreSQL locally
2. Create a database:
```bash
createdb rajai
```
3. Use the local connection string:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/rajai
```

##### NODE_ENV

Set the environment mode:

```env
NODE_ENV=development
```

#### Optional Configuration

The following variables have sensible defaults but can be customized:

```env
# Server Configuration
PORT=5001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5001

# Logging
LOG_LEVEL=debug

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Caching
ENABLE_RESPONSE_CACHE=false
CACHE_TTL_SECONDS=300

# Execution Timeout
EXECUTION_TIMEOUT_MS=300000
```

### 4. Initialize Database

Push the database schema to your PostgreSQL database:

```bash
npm run db:push
```

This will create the necessary tables (`agents` and `executions`).

### 5. Validate Configuration

Run the validation script to ensure everything is configured correctly:

```bash
npm run validate
```

If you see ✅ messages, you're ready to go!

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5001**

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This starts the development server with:
- Hot module replacement (HMR)
- TypeScript compilation
- Automatic restart on file changes

### Type Checking

```bash
npm run check
```

Runs TypeScript compiler to check for type errors without emitting files.

### Building for Production

```bash
npm run build
```

This creates optimized production builds:
- Client bundle in `dist/client/`
- Server bundle in `dist/index.js`

### Starting Production Server

```bash
npm start
```

Runs the production build. Make sure to set `NODE_ENV=production` in your `.env` file.

## Deployment

### Deploying to Vercel

1. **Fork the Repository**
   - Go to the [GitHub repository](https://github.com/rajshah9305/Crewsaisingle)
   - Click "Fork" to create your own copy

2. **Import to Vercel**
   - Visit [Vercel](https://vercel.com/new)
   - Click "Import Project"
   - Select your forked repository

3. **Configure Environment Variables**
   
   In the Vercel dashboard, add the following environment variables:
   
   - `GOOGLE_API_KEY` - Your Google Gemini API key
   - `DATABASE_URL` - Your PostgreSQL connection string (use Neon for best integration)
   - `NODE_ENV` - Set to `production`

4. **Deploy**
   
   Click "Deploy" and Vercel will:
   - Install dependencies
   - Build the application
   - Deploy to a production URL

5. **Initialize Database**
   
   After deployment, you need to push the database schema:
   
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link to your project
   vercel link
   
   # Run database migration
   vercel env pull .env.local
   npm run db:push
   ```

### Deploying to Other Platforms

The application can be deployed to any platform that supports Node.js:

- **Railway**: Connect your GitHub repo and set environment variables
- **Render**: Create a new Web Service and configure environment variables
- **Heroku**: Use the Heroku CLI to deploy
- **DigitalOcean App Platform**: Connect your repo and configure

## Troubleshooting

### Common Issues

#### "DATABASE_URL environment variable is not set"

**Solution**: Make sure your `.env` file exists and contains a valid `DATABASE_URL`.

#### "Failed to connect to database"

**Solutions**:
1. Check that your database is running
2. Verify the connection string is correct
3. Ensure your IP is whitelisted (for cloud databases)
4. Check if SSL is required (add `?sslmode=require` to the URL)

#### "GOOGLE_API_KEY is not configured"

**Solution**: Ensure you have a valid Google Gemini API key in your `.env` file.

#### TypeScript Errors

**Solution**: Run `npm run check` to see detailed error messages. All type errors should be resolved in this version.

#### Port Already in Use

**Solution**: Change the `PORT` variable in your `.env` file to an available port (e.g., 5002).

#### Build Fails

**Solutions**:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Run `npm run build`

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/rajshah9305/Crewsaisingle/issues)
2. Review the application logs
3. Check the browser console for client-side errors
4. Review the terminal output for server-side errors

## Project Structure

```
Crewsaisingle/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and query client
│   │   └── App.tsx         # Main application component
│   └── index.html
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   ├── utils/              # Server utilities
│   ├── config.ts           # Configuration management
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database operations
│   ├── gemini.ts           # Gemini API integration
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema
├── scripts/                # Build and validation scripts
├── .env                    # Environment variables (create this)
├── .env.example            # Environment template
├── package.json            # Dependencies and scripts
└── README.md               # Project documentation
```

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

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use strong database passwords**
3. **Rotate API keys regularly**
4. **Enable CORS only for trusted origins**
5. **Use HTTPS in production**
6. **Keep dependencies updated**

## Next Steps

After setup:

1. Create your first agent
2. Configure agent roles and tasks
3. Execute agents and view results
4. Explore agent templates
5. Customize the UI to your needs

## Resources

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Neon PostgreSQL Guide](https://neon.tech/docs)

## License

MIT License - see [LICENSE](LICENSE) file for details.
