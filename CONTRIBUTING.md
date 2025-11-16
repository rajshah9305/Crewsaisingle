# Contributing to RAJAI Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Push database schema: `npm run db:push`
5. Start development server: `npm run dev`

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings
- Follow existing code patterns

### Naming Conventions

- **Files**: kebab-case (`agent-card.tsx`)
- **Components**: PascalCase (`AgentCard`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## Project Structure

```
client/src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
└── lib/            # Utilities

server/
├── utils/          # Server utilities
├── routes.ts       # API routes
├── storage.ts      # Database layer
└── gemini.ts       # AI integration
```

## Making Changes

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a pull request

## Testing

```bash
# Run type checking
npm run check

# Run validation
npm run validate
```

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Follow the PR template
4. Request review from maintainers
5. Address feedback promptly

## Commit Messages

Use clear, descriptive commit messages:

```
feat: Add agent reordering functionality
fix: Resolve database connection timeout
docs: Update deployment guide
style: Format code with prettier
refactor: Simplify error handling logic
```

## Questions?

Open an issue for discussion before starting major changes.
