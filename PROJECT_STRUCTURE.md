# GitHub Partner AI - Project Structure

This document provides a comprehensive overview of the project structure and explains the purpose of each main logic file in the GitHub Partner AI workspace.

## 📁 Project Overview

The GitHub Partner AI is an advanced AI agent built with Mastra that provides comprehensive analysis and management capabilities for GitHub repositories. It features deep repository analysis, security scanning, code quality assessment, and MCP (Model Context Protocol) integration.

## 🏗️ Directory Structure

```
github-partner-ai/
├── src/                          # Source code directory
│   ├── mastra/                   # Mastra framework components
│   │   ├── agents/               # AI agents
│   │   ├── tools/                # GitHub analysis tools
│   │   ├── workflows/            # Workflow definitions
│   │   ├── mcp/                  # MCP server configuration
│   │   └── index.ts              # Main Mastra instance
│   ├── lib/                      # Core library files
│   └── examples/                 # Usage examples
├── .mastra/                      # Mastra build output
├── node_modules/                 # Dependencies
├── package.json                  # Project configuration
└── README.md                     # Project documentation
```

## 🔧 Core Components

### **Agents** (`src/mastra/agents/`)

#### `github-expert.ts`

**Purpose**: The primary AI agent for comprehensive GitHub repository analysis.

**Key Features**:

- Advanced repository analysis without relying on documentation
- Code quality assessment and security scanning
- Comprehensive metrics and performance analysis
- Intelligent repository search and filtering
- Dependency analysis and vulnerability detection
- Modern development practice evaluation

**Tools Used**: 8 advanced tools including security scanning, code quality analysis, and repository metrics.

### **Tools** (`src/mastra/tools/`)

#### `github-repository.ts`

**Purpose**: Core GitHub repository operations.

**Key Functions**:

- Lists repositories with filtering and sorting options
- Provides basic repository information
- Supports pagination and search functionality

#### `github-analyzer.ts`

**Purpose**: Basic codebase structure and technology analysis.

**Key Functions**:

- Analyzes repository structure and file organization
- Detects programming languages and frameworks
- Identifies project patterns and architecture
- Provides basic codebase insights

#### `github-file.ts`

**Purpose**: File creation and modification operations.

**Key Functions**:

- Creates new files in repositories
- Updates existing files
- Handles file permissions and content management

#### `github-advanced.ts`

**Purpose**: Advanced repository analysis and metrics.

**Key Functions**:

- **`getRepositoryMetricsTool`**: Comprehensive repository statistics
- **`searchRepositoriesTool`**: Advanced repository search with multiple filters
- **`getCodeQualityTool`**: Code quality assessment and scoring

**Features**:

- Engagement scoring and popularity metrics
- Code quality evaluation with recommendations
- Advanced filtering and sorting capabilities

#### `github-security.ts`

**Purpose**: Security analysis and vulnerability detection.

**Key Functions**:

- **`securityScanTool`**: Performs security vulnerability scanning
- **`dependencyAnalysisTool`**: Analyzes dependencies for security issues

**Features**:

- Sensitive file detection
- Hardcoded secret identification
- Dependency vulnerability scanning
- Security configuration assessment

### **Workflows** (`src/mastra/workflows/`)

#### `comprehensive-analysis.ts`

**Purpose**: Orchestrates comprehensive repository analysis workflow.

**Workflow Steps**:

1. **Find Repository**: Locates target repository
2. **Basic Analysis**: Performs codebase structure analysis
3. **Repository Metrics**: Calculates comprehensive metrics
4. **Code Quality**: Assesses code quality and patterns
5. **Security Analysis**: Performs security vulnerability scanning
6. **Dependency Analysis**: Analyzes project dependencies
7. **Generate Report**: Creates comprehensive analysis report

**Features**:

- Optional analysis steps (configurable)
- Error handling and recovery
- Progress tracking
- Detailed reporting with recommendations

#### `analyze-codebase.ts`

**Purpose**: Basic codebase analysis workflow.

**Features**:

- Repository structure analysis
- Technology detection
- Basic insights generation

### **MCP Integration** (`src/mastra/mcp/`)

#### `github-mcp-server.ts`

**Purpose**: Exposes all GitHub tools and agents via Model Context Protocol.

**Exposed Components**:

- **Agents**: `githubExpertAgent`
- **Tools**: All 8 GitHub analysis tools
- **Workflows**: `comprehensiveAnalysisWorkflow`

**Features**:

- MCP server configuration
- Tool and agent exposure
- External client integration support

### **Core Library** (`src/lib/`)

#### `github-service.ts`

**Purpose**: Enhanced GitHub API service with advanced features.

**Key Features**:

- **Rate Limiting**: Automatic retry and throttling
- **Caching**: 5-minute TTL for improved performance
- **Error Handling**: Comprehensive error recovery
- **Multi-Account Support**: Handles multiple GitHub accounts

**Enhancements**:

- Octokit plugins for retry and throttling
- Intelligent caching system
- Graceful failure handling

#### `code-analyzer.ts`

**Purpose**: Static code analysis and pattern detection.

**Key Functions**:

- Framework and technology detection
- Code complexity assessment
- Architecture pattern recognition
- Main purpose inference
- Key feature extraction

#### `types.ts`

**Purpose**: TypeScript type definitions for the entire project.

**Key Types**:

- `GitHubAccount`: Account configuration
- `Repository`: Repository data structure
- `ProjectStructure`: Codebase structure representation
- `CodebaseAnalysis`: Analysis results
- `ResumeProject`: Resume-specific project data

### **Configuration** (`src/mastra/`)

#### `index.ts`

**Purpose**: Main Mastra instance configuration.

**Components**:

- **Workflows**: All defined workflows
- **Agents**: All AI agents
- **MCP Servers**: MCP server instances
- **Storage**: LibSQL storage configuration
- **Logger**: Pino logger setup

## 🔄 Data Flow

```
GitHub API → GitHubService → Tools → Agents → Workflows → MCP Server → External Clients
```

1. **GitHub API**: Raw repository data
2. **GitHubService**: Enhanced data with caching and rate limiting
3. **Tools**: Processed analysis and metrics
4. **Agents**: AI-powered insights and recommendations
5. **Workflows**: Orchestrated analysis pipelines
6. **MCP Server**: External tool integration
7. **External Clients**: End-user applications

## 🛠️ Key Technologies

- **Mastra Framework**: Core AI agent framework
- **TypeScript**: Type-safe development
- **Octokit**: GitHub API client with plugins
- **LibSQL**: Database storage
- **Zod**: Schema validation
- **OpenAI**: AI model integration
- **MCP**: Model Context Protocol for external integration

## 📊 Analysis Capabilities

### **Repository Analysis**

- Structure and organization assessment
- Technology stack identification
- Code quality evaluation
- Performance metrics calculation

### **Security Analysis**

- Vulnerability scanning
- Dependency security assessment
- Sensitive data detection
- Security configuration review

### **Code Quality**

- Modern practice evaluation
- Testing coverage assessment
- Documentation completeness
- CI/CD pipeline analysis

### **Metrics & Insights**

- Engagement scoring
- Popularity metrics
- Activity analysis
- Trend identification

## 🚀 Usage Patterns

### **Direct Agent Usage**

```typescript
const agent = mastra.getAgent("githubExpertAgent");
const response = await agent.generate("Analyze repository...");
```

### **Workflow Execution**

```typescript
const workflow = mastra.getWorkflow("comprehensiveAnalysisWorkflow");
const result = await workflow.createRunAsync({...}).start();
```

### **MCP Integration**

```typescript
// External clients can connect via MCP protocol
const mcpClient = new MCPClient({...});
```

## 🔧 Development Workflow

1. **Development**: `pnpm run dev`
2. **Type Checking**: `pnpm run typecheck`
3. **Building**: `pnpm run build`
4. **Production**: `pnpm run start`

## 📈 Performance Optimizations

- **Caching**: Intelligent API response caching
- **Rate Limiting**: GitHub API compliance
- **Parallel Processing**: Concurrent analysis operations
- **Error Recovery**: Graceful failure handling
- **Resource Management**: Efficient memory usage

## 🔒 Security Features

- **API Key Management**: Secure credential handling
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error reporting
- **Dependency Scanning**: Vulnerability detection

This project structure provides a robust, scalable foundation for advanced GitHub repository analysis with AI-powered insights and comprehensive tooling.
