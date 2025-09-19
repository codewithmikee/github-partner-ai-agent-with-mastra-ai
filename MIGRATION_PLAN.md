# Migration Plan: Mastra MCP → Official MCP TypeScript SDK

## 🎯 Migration Overview

This document outlines the migration from `@mastra/mcp` to the official `@modelcontextprotocol/sdk` for better performance, type safety, and advanced features.

## 📦 Dependencies Update

### Current Dependencies

```json
{
  "@mastra/mcp": "^0.13.0"
}
```

### New Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.18.1",
  "@mastra/mcp": "^0.13.0" // Keep for compatibility during migration
}
```

## 🔧 Implementation Changes

### 1. Update MCP Server Implementation

**Current (Mastra MCP):**

```typescript
import { MCPServer } from "@mastra/mcp";

export const githubMCPServer = new MCPServer({
  id: "github-ai-server",
  name: "GitHub AI Analysis Server",
  // ... configuration
});
```

**New (Official SDK):**

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const server = new McpServer({
  name: "github-ai-server",
  version: "2.0.0",
});

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_repositories",
        description: "List GitHub repositories",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", default: 20 },
            sortBy: { type: "string", enum: ["stars", "forks", "updated"] },
          },
        },
      },
      // ... other tools
    ],
  };
});

// Register tool handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_repositories":
      return await listRepositoriesTool.execute({ context: args });
    case "analyze_codebase":
      return await analyzeCodebaseTool.execute({ context: args });
    // ... other tools
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});
```

### 2. Enhanced Features Implementation

#### A. Sampling Support

```typescript
// Add sampling capability for AI completions
server.setRequestHandler(SampleRequestSchema, async (request) => {
  const { prompt, model, maxTokens } = request.params;

  // Use your existing AI models
  const response = await openai.chat.completions.create({
    model: model || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: maxTokens || 1000,
  });

  return {
    content: response.choices[0].message.content,
  };
});
```

#### B. Elicitation Support

```typescript
// Add elicitation for interactive user input
server.setRequestHandler(ElicitRequestSchema, async (request) => {
  const { message, requestedSchema } = request.params;

  // This would integrate with your UI to collect user input
  return {
    action: "accept", // or "decline", "cancel"
    content: {
      // User's response data
    },
  };
});
```

### 3. Transport Configuration

#### HTTP Transport (Recommended)

```typescript
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

// Session management
const sessions = new Map<string, StreamableHTTPServerTransport>();

app.all("/mcp", async (req, res) => {
  const sessionId =
    (req.headers["x-session-id"] as string) ||
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  let transport = sessions.get(sessionId);
  if (!transport) {
    transport = new StreamableHTTPServerTransport("/mcp", res);
    sessions.set(sessionId, transport);
    await server.connect(transport);
  }

  await transport.handleRequest(req, res);
});

app.listen(3000, () => {
  console.log("MCP Server running on http://localhost:3000/mcp");
});
```

#### Stdio Transport (For CLI tools)

```typescript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const transport = new StdioServerTransport();
await server.connect(transport);
```

## 🚀 Migration Steps

### Phase 1: Setup (1-2 hours)

1. Install official SDK: `pnpm add @modelcontextprotocol/sdk`
2. Create new MCP server file: `src/mastra/mcp/github-mcp-server-v2.ts`
3. Implement basic server structure with tool registration

### Phase 2: Tool Migration (2-3 hours)

1. Migrate each tool to use official SDK handlers
2. Update tool schemas to match MCP specification
3. Test individual tools

### Phase 3: Advanced Features (2-3 hours)

1. Implement sampling capability
2. Add elicitation support
3. Configure HTTP transport with session management

### Phase 4: Testing & Deployment (1-2 hours)

1. Test all tools and workflows
2. Update client connections
3. Deploy and monitor

## 📊 Benefits After Migration

### Performance Improvements

- **Faster Response Times**: Native MCP implementation
- **Better Memory Usage**: Optimized resource management
- **Improved Caching**: Built-in caching mechanisms

### Enhanced Features

- **Sampling**: AI completions through MCP
- **Elicitation**: Interactive user input
- **Better Error Handling**: Robust error recovery
- **Multiple Transports**: HTTP, SSE, Stdio support

### Developer Experience

- **Better TypeScript Support**: Full type safety
- **Comprehensive Documentation**: Official docs and examples
- **Active Community**: Regular updates and support
- **Future-Proof**: Long-term maintenance

## 🔧 Configuration Examples

### Client Connection (HTTP)

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({
  name: "github-ai-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3000/mcp")
);

await client.connect(transport);

// Use tools
const result = await client.callTool({
  name: "list_repositories",
  arguments: { limit: 10, sortBy: "stars" },
});
```

### Client Connection (Stdio)

```typescript
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["dist/mcp-server.js"],
});

await client.connect(transport);
```

## 🎯 Recommended Approach

1. **Keep Current Implementation**: Maintain existing `@mastra/mcp` setup
2. **Parallel Development**: Create new implementation alongside
3. **Gradual Migration**: Migrate tools one by one
4. **A/B Testing**: Test both implementations
5. **Full Switch**: Complete migration once stable

This approach ensures zero downtime and allows for thorough testing of the new implementation.
