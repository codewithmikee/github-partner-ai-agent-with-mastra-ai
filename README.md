# 🚀 GitHub Partner AI

> **Advanced AI-powered GitHub repository analysis platform with interactive playground and intelligent insights.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Mastra](https://img.shields.io/badge/Mastra-0.17.1-purple.svg)](https://mastra.ai/)
[![MCP](https://img.shields.io/badge/MCP-0.13.0-green.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## ✨ Features

### 🎯 **Single Account Focus**

- **Streamlined Configuration**: One GitHub account, simple setup
- **Environment Variables**: Easy configuration with `.env` file
- **Runtime Override**: Change credentials through the playground UI

### 🖥️ **Interactive Playground**

- **Beautiful Web Interface**: Modern, responsive UI for repository analysis
- **Real-time Analysis**: Instant repository insights and recommendations
- **Visual Results**: Clear, organized analysis results with actionable insights

### 🤖 **AI-Powered Analysis**

- **Intelligent Code Quality Assessment**: Comprehensive scoring with recommendations
- **Security Vulnerability Scanning**: Automated detection of security issues
- **Technology Stack Detection**: Automatic framework and library identification
- **Best Practice Evaluation**: Modern development practices assessment

### 🔧 **Developer-Friendly**

- **Easy Setup**: Get started in minutes with environment variables
- **TypeScript**: Full type safety and excellent developer experience
- **Mastra Framework**: Built on the powerful Mastra AI agent framework
- **MCP Integration**: Model Context Protocol support for external tools

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.9.0
- **pnpm** (recommended) or npm
- **GitHub Personal Access Token** ([Generate here](https://github.com/settings/tokens))
- **OpenAI API Key** ([Get here](https://platform.openai.com/api-keys))

### Installation

#### Option 1: Interactive Setup (Recommended)

1. **Clone and setup**

   ```bash
   git clone <repository-url>
   cd github-partner-ai
   pnpm install
   pnpm run setup
   ```

2. **Start the playground**

   ```bash
   pnpm run playground
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser! 🎉

#### Option 2: Manual Setup

1. **Clone and install**

   ```bash
   git clone <repository-url>
   cd github-partner-ai
   pnpm install
   ```

2. **Configure environment**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your credentials:

   ```env
   GITHUB_USERNAME=your-github-username
   GITHUB_TOKEN=ghp_your_personal_access_token_here
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Start the playground**

   ```bash
   pnpm run playground
   ```

   Open [http://localhost:3001](http://localhost:3001) in your browser! 🎉

## 🎮 Playground Usage

The playground provides an intuitive web interface for repository analysis:

### 1. **Configuration**

- Set your GitHub username and token
- Environment variables are used as defaults
- Override anytime through the UI

### 2. **Repository Analysis**

- Browse your repositories
- Select any repository for analysis
- Get instant insights and recommendations

### 3. **Analysis Results**

- **Repository Overview**: Basic stats and information
- **Code Analysis**: Technology stack and complexity
- **Insights**: Structure, testing, documentation status
- **Recommendations**: Actionable improvement suggestions

## 🛠️ Development

### Available Scripts

```bash
# Start the playground (recommended for most users)
pnpm run playground

# Start playground in development mode (auto-reload)
pnpm run playground:dev

# Start Mastra development server
pnpm run dev

# Build the project
pnpm run build

# Type checking
pnpm run typecheck
```

### Project Structure

```
github-partner-ai/
├── src/
│   ├── lib/
│   │   ├── github-service.ts    # GitHub API service
│   │   ├── code-analyzer.ts     # Code analysis logic
│   │   └── types.ts             # TypeScript types
│   └── mastra/
│       ├── agents/              # AI agents
│       ├── tools/               # GitHub analysis tools
│       ├── workflows/           # Analysis workflows
│       └── mcp/                 # MCP server
├── playground/
│   ├── index.html              # Playground UI
│   ├── server.js               # Playground API server
│   └── package.json            # Playground dependencies
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# GitHub Configuration (Required)
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=ghp_your_personal_access_token_here

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Server Ports
PLAYGROUND_PORT=3001
MASTRA_PORT=3000
```

### GitHub Token Setup

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select these scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `read:org` (Read org and team membership)
4. Copy the token and add it to your `.env` file

## 📖 API Usage

### Programmatic Usage

```typescript
import { mastra } from "./src/mastra";

// Get the GitHub Expert Agent
const agent = mastra.getAgent("githubExpertAgent");

// Analyze a repository
const response = await agent.generate(`
  Analyze the repository "facebook/react" and provide:
  1. Code quality assessment
  2. Security analysis
  3. Technology stack identification
  4. Improvement recommendations
`);

// Run comprehensive analysis workflow
const workflow = mastra.getWorkflow("comprehensiveAnalysisWorkflow");
const result = await workflow
  .createRunAsync({
    owner: "facebook",
    repo: "react",
    includeSecurity: true,
    includeQuality: true,
    includeMetrics: true,
    includeDependencies: true,
  })
  .start();
```

### MCP Integration

```typescript
// Connect via MCP client
import { Client } from "@modelcontextprotocol/sdk/client";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";

const client = new Client({
  name: "github-ai-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp")
);

await client.connect(transport);

// Use GitHub analysis tools
const result = await client.callTool({
  name: "analyze_codebase",
  arguments: {
    owner: "microsoft",
    repo: "vscode",
  },
});
```

## 🏗️ Architecture

### Core Components

- **GitHub Service**: Handles GitHub API calls with caching and rate limiting
- **Code Analyzer**: Analyzes repository structure and code patterns
- **AI Agents**: Provide intelligent analysis and recommendations
- **Workflows**: Orchestrate complex analysis processes
- **MCP Server**: Exposes tools and agents via Model Context Protocol
- **Playground**: Interactive web interface for easy usage

### Data Flow

```
GitHub API → GitHub Service → Tools → Agents → Workflows → MCP Server → Playground UI
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write comprehensive tests
- Update documentation as needed

## 📊 Analysis Capabilities

### Repository Analysis

- Structure and organization assessment
- Technology stack identification
- Code quality evaluation
- Performance metrics calculation

### Security Analysis

- Vulnerability scanning
- Dependency security assessment
- Sensitive data detection
- Security configuration review

### Code Quality

- Modern practice evaluation
- Testing coverage assessment
- Documentation completeness
- CI/CD pipeline analysis

### Metrics & Insights

- Engagement scoring
- Popularity metrics
- Activity analysis
- Trend identification

## 🛠️ Key Technologies

- **Mastra Framework**: Core AI agent framework
- **TypeScript**: Type-safe development
- **Octokit**: GitHub API client with plugins
- **LibSQL**: Database storage
- **Zod**: Schema validation
- **OpenAI**: AI model integration
- **MCP**: Model Context Protocol for external integration
- **Express**: Playground API server
- **HTML/CSS/JS**: Playground UI

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Mastra](https://mastra.ai/) - AI agent framework
- [Model Context Protocol](https://modelcontextprotocol.io/) - Tool integration standard
- [GitHub API](https://docs.github.com/en/rest) - Repository data source
- [OpenAI](https://openai.com/) - AI analysis capabilities
- **Cursor AI** - Code generation, MCP implementation, and README enhancement

---

**Made with ❤️ for the developer community**
