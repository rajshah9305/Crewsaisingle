# Contributing to RAJAI Platform

Thank you for your interest in contributing to the RAJAI Platform! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Crewsaisingle.git
   cd Crewsaisingle
   ```
3. **Set up the development environment** following [SETUP.md](SETUP.md)
4. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```

## 📋 Development Workflow

### Before You Start

- Check existing [issues](https://github.com/rajshah9305/Crewsaisingle/issues) to see if your idea is already being discussed
- For major changes, open an issue first to discuss your proposed changes
- Make sure you have the latest code from the main branch

### Making Changes

1. **Write clean, readable code** that follows the existing code style
2. **Add comments** for complex logic
3. **Update documentation** if you're changing functionality
4. **Test your changes** thoroughly

### Code Style Guidelines

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the existing code formatting (we use Prettier-compatible style)
- Use meaningful variable and function names
- Prefer `const` over `let`, avoid `var`
- Use async/await instead of raw promises
- Add proper type annotations

#### React Components
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types with TypeScript interfaces

#### API Routes
- Follow RESTful conventions
- Add proper error handling
- Use appropriate HTTP status codes
- Validate all inputs with Zod schemas
- Add logging for important operations

### Testing

Before submitting your changes:

```bash
# Run TypeScript type checking
npm run check

# Build the application
npm run build

# Test the API endpoints (requires running server)
npm run dev
# In another terminal:
./scripts/test-api.sh
```

### Commit Messages

Write clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add pagination to executions endpoint"
git commit -m "Fix: Resolve agent reordering type mismatch"
git commit -m "Docs: Update setup instructions for Neon database"

# Bad commit messages (avoid these)
git commit -m "fix bug"
git commit -m "update"
git commit -m "changes"
```

**Commit Message Format:**
- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit first line to 72 characters
- Reference issues and pull requests when relevant

### Pull Request Process

1. **Update your branch** with the latest main branch:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what changed and why
   - Screenshots for UI changes
   - Reference to related issues (e.g., "Fixes #123")

4. **Respond to feedback** from reviewers promptly

5. **Ensure CI passes** - all automated checks must pass

## 🐛 Reporting Bugs

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the bug
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**:
  - OS and version
  - Node.js version
  - Browser and version (for UI bugs)
  - Database type and version

## 💡 Suggesting Features

When suggesting features:

- **Check existing issues** to avoid duplicates
- **Describe the problem** you're trying to solve
- **Propose a solution** with as much detail as possible
- **Consider alternatives** and explain why your solution is best
- **Think about edge cases** and potential issues

## 📝 Documentation

Good documentation is crucial! When contributing:

- Update README.md for user-facing changes
- Update SETUP.md for setup/configuration changes
- Add JSDoc comments for new functions
- Update API documentation for endpoint changes
- Add inline comments for complex logic

## 🔒 Security

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Wait for a response before disclosing publicly

## 🎨 UI/UX Guidelines

When working on the frontend:

- **Follow the existing design system** (colors, spacing, typography)
- **Ensure responsive design** - test on mobile, tablet, and desktop
- **Maintain accessibility** - use proper ARIA labels, keyboard navigation
- **Keep the orange color scheme** consistent
- **Test in multiple browsers** (Chrome, Firefox, Safari, Edge)

### Color Palette

- Primary: Orange (#FF6B35 and variants)
- Text: Black (#000000) with opacity variants
- Background: White (#FFFFFF) with subtle gradients
- Borders: Black with 10% opacity (#00000019)

## 🏗️ Architecture Guidelines

### Backend (Server)

- **Keep routes thin** - business logic goes in services
- **Use proper error handling** - wrap async operations
- **Add logging** for important operations
- **Validate inputs** with Zod schemas
- **Use transactions** for multi-step database operations

### Frontend (Client)

- **Use React Query** for server state management
- **Keep components focused** - single responsibility
- **Extract reusable logic** into custom hooks
- **Use proper loading states** for async operations
- **Handle errors gracefully** with user-friendly messages

### Database

- **Use migrations** for schema changes
- **Add indexes** for frequently queried fields
- **Use transactions** for data consistency
- **Avoid N+1 queries** - use joins or batch operations

## 📦 Dependencies

When adding new dependencies:

- **Justify the addition** - explain why it's needed
- **Check bundle size** - avoid large dependencies
- **Verify license compatibility** - must be MIT-compatible
- **Check maintenance status** - prefer actively maintained packages
- **Add to appropriate section** in package.json (dependencies vs devDependencies)

## ✅ Checklist Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] TypeScript compilation passes (`npm run check`)
- [ ] Build succeeds (`npm run build`)
- [ ] All tests pass (if applicable)
- [ ] Documentation is updated
- [ ] Commit messages are clear and descriptive
- [ ] PR description explains the changes
- [ ] Screenshots included for UI changes
- [ ] No console.log statements in production code
- [ ] No commented-out code
- [ ] No TODO comments without associated issues

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Assume good intentions
- Respect different viewpoints and experiences

## 📞 Getting Help

- **Documentation**: Check README.md and SETUP.md first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community channels (if available)

## 🎉 Recognition

Contributors will be:
- Listed in the project's contributors
- Mentioned in release notes for significant contributions
- Credited in documentation for major features

Thank you for contributing to RAJAI Platform! 🚀
