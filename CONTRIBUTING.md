# 🤝 Contributing to GitHub Partner AI

Thank you for your interest in contributing to GitHub Partner AI! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code Style](#code-style)
- [Testing](#testing)

## Code of Conduct

This project follows a code of conduct that we expect all contributors to adhere to. By participating, you agree to uphold this code.

### Our Pledge

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- pnpm (recommended) or npm
- Git
- GitHub account

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/your-username/github-partner-ai.git
   cd github-partner-ai
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub and OpenAI API keys
   ```

4. **Run development server**
   ```bash
   pnpm run dev
   ```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug Fixes**: Fix issues and improve stability
- **Features**: Add new functionality and capabilities
- **Documentation**: Improve docs, examples, and guides
- **Tests**: Add or improve test coverage
- **Performance**: Optimize code and improve performance
- **Security**: Enhance security features and practices

### Before You Start

1. **Check existing issues** - Look for existing issues or discussions
2. **Start small** - Begin with small, focused changes
3. **Ask questions** - Don't hesitate to ask for clarification
4. **Follow the process** - Use the established workflow

## Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

- Write clean, well-documented code
- Follow the established code style
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run type checking
pnpm run typecheck

# Run tests (when available)
pnpm test

# Test the development server
pnpm run dev
```

### 4. Commit Your Changes

```bash
# Use conventional commit messages
git add .
git commit -m "feat: add new analysis tool for code complexity"
# or
git commit -m "fix: resolve memory leak in GitHub service"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear title and description
- Reference to related issues
- Screenshots or examples if applicable

## Issue Reporting

### Before Creating an Issue

1. **Search existing issues** - Check if the issue already exists
2. **Check documentation** - Ensure it's not covered in docs
3. **Try latest version** - Make sure you're using the latest code

### Creating a Good Issue

**Bug Reports:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages or logs

**Feature Requests:**
- Clear description of the feature
- Use case and motivation
- Proposed solution (if any)
- Additional context

### Issue Templates

Use the provided issue templates:
- Bug Report
- Feature Request
- Documentation
- Question

## Code Style

### TypeScript Guidelines

```typescript
// Use meaningful names
const repositoryAnalysis = await analyzeRepository(repo);

// Add JSDoc comments for public APIs
/**
 * Analyzes a GitHub repository for code quality and security issues
 * @param owner - Repository owner username
 * @param repo - Repository name
 * @returns Promise<AnalysisResult> - Comprehensive analysis results
 */
export async function analyzeRepository(owner: string, repo: string): Promise<AnalysisResult> {
  // Implementation
}

// Use proper typing
interface RepositoryConfig {
  readonly name: string;
  readonly owner: string;
  readonly private: boolean;
}
```

### File Organization

```
src/
├── mastra/
│   ├── agents/           # AI agents
│   ├── tools/            # Analysis tools
│   ├── workflows/        # Workflow definitions
│   └── mcp/             # MCP server
├── lib/                  # Core utilities
└── types/               # Type definitions
```

### Naming Conventions

- **Files**: kebab-case (`github-service.ts`)
- **Classes**: PascalCase (`GitHubService`)
- **Functions**: camelCase (`analyzeRepository`)
- **Constants**: UPPER_SNAKE_CASE (`CACHE_TTL`)
- **Interfaces**: PascalCase with `I` prefix (`IRepository`)

## Testing

### Test Structure

```typescript
// Example test structure
describe('GitHubService', () => {
  describe('getAllRepositories', () => {
    it('should return repositories for valid account', async () => {
      // Arrange
      const service = new GitHubService();
      
      // Act
      const repos = await service.getAllRepositories();
      
      // Assert
      expect(repos).toBeDefined();
      expect(Array.isArray(repos)).toBe(true);
    });
  });
});
```

### Test Guidelines

- Write tests for new functionality
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests focused and independent
- Mock external dependencies

## Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include examples in documentation
- Update README for new features
- Keep inline comments concise and helpful

### Documentation Updates

When adding new features:
1. Update README.md
2. Add JSDoc comments
3. Update API documentation
4. Add usage examples

## Release Process

### Version Bumping

We use semantic versioning (SemVer):
- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features (backward compatible)
- **Major** (2.0.0): Breaking changes

### Changelog

Update CHANGELOG.md with:
- New features
- Bug fixes
- Breaking changes
- Deprecations

## Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Discord**: For real-time chat (if available)

### Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (ISC License).

---

Thank you for contributing to GitHub Partner AI! 🚀
