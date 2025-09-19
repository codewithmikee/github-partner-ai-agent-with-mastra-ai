/**
 * @fileoverview GitHub MCP Server - Model Context Protocol Integration
 * @author Mikias Birhanu <mikias.birhanu@example.com>
 * @created 2024-12-19
 * @description This module defines the Model Context Protocol (MCP) server that exposes
 * GitHub analysis tools and agents to external clients. It provides a standardized
 * interface for integrating the GitHub Partner AI capabilities with other applications
 * and development tools.
 * 
 * The MCP server enables:
 * - External tool integration via standardized protocol
 * - Cross-platform compatibility with MCP-compliant clients
 * - Scalable deployment and distribution
 * - Professional API exposure for enterprise use
 */

import { MCPServer } from "@mastra/mcp";
import { githubExpertAgent } from "../agents";
import {
  listRepositoriesTool,
  analyzeCodebaseTool,
  createFileTool,
  getRepositoryMetricsTool,
  searchRepositoriesTool,
  getCodeQualityTool,
  securityScanTool,
  dependencyAnalysisTool,
} from "../tools";

/**
 * GitHub MCP Server Configuration
 * 
 * This server exposes the complete GitHub Partner AI platform via Model Context Protocol,
 * enabling external clients to access advanced repository analysis capabilities through
 * a standardized interface.
 */
export const githubMCPServer = new MCPServer({
  // Server identification and metadata
  id: "github-ai-server",
  name: "GitHub AI Analysis Server",
  version: "2.0.0",
  description:
    "Advanced GitHub repository analysis and management with AI-powered insights",
  
  /**
   * Agent Configuration
   * Exposes AI agents for intelligent repository analysis
   */
  agents: {
    githubExpertAgent: githubExpertAgent,  // Advanced GitHub analysis agent
  },
  
  /**
   * Tool Configuration
   * Comprehensive set of GitHub analysis tools organized by category
   */
  tools: {
    // Core GitHub Operations
    listRepositories: listRepositoriesTool,    // Repository discovery and listing
    analyzeCodebase: analyzeCodebaseTool,      // Basic codebase structure analysis
    createFile: createFileTool,                // File creation and modification

    // Advanced Analysis Tools
    getRepositoryMetrics: getRepositoryMetricsTool,  // Comprehensive metrics and statistics
    searchRepositories: searchRepositoriesTool,      // Advanced repository search and filtering
    getCodeQuality: getCodeQualityTool,              // Code quality assessment and scoring

    // Security and Dependency Analysis
    securityScan: securityScanTool,                  // Security vulnerability scanning
    dependencyAnalysis: dependencyAnalysisTool,      // Dependency analysis and vulnerability detection
  },
  
  /**
   * Repository Information
   * Source repository metadata for the MCP server
   */
  repository: {
    url: "https://github.com/your-username/github-partner-ai",
    source: "github",
    id: "github-partner-ai",
  },
  
  /**
   * Package Information
   * NPM package metadata for distribution
   */
  packages: [
    {
      name: "github-partner-ai",
      version: "2.0.0",
      registry_name: "npm",
    },
  ],
  
  /**
   * Remote Endpoints
   * Available transport endpoints for client connections
   */
  remotes: [
    {
      url: "https://your-domain.com/mcp",
      transport_type: "http",
    },
  ],
});
