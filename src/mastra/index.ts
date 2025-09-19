/**
 * @fileoverview Main Mastra Instance Configuration - GitHub Partner AI
 * @author Mikias Birhanu <mikias.birhanu@example.com>
 * @created 2024-12-19
 * @description This module configures the main Mastra instance for the GitHub Partner AI
 * application, integrating agents, workflows, MCP servers, and storage components.
 *
 * The configuration provides a comprehensive AI-powered GitHub analysis platform
 * with advanced repository analysis capabilities, security scanning, and code quality
 * assessment tools accessible via Model Context Protocol (MCP).
 */

import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { githubExpertAgent } from "./agents";
import {
  analyzeCodebaseWorkflow,
  comprehensiveAnalysisWorkflow,
} from "./workflows";
import { githubMCPServer } from "./mcp/github-mcp-server";

/**
 * Main Mastra Instance Configuration
 *
 * This configuration sets up the complete GitHub Partner AI platform with:
 * - AI agents for intelligent repository analysis
 * - Workflows for orchestrated analysis processes
 * - MCP server for external tool integration
 * - Persistent storage for data and telemetry
 * - Structured logging for monitoring and debugging
 */
export const mastra = new Mastra({
  /**
   * Workflow Configuration
   * Orchestrated processes for complex repository analysis tasks
   */
  workflows: {
    analyzeCodebaseWorkflow, // Basic codebase structure analysis
    comprehensiveAnalysisWorkflow, // Full repository analysis with metrics, quality, and security
  },

  /**
   * Agent Configuration
   * AI agents that provide intelligent analysis and recommendations
   */
  agents: {
    githubExpertAgent, // Advanced GitHub repository analysis agent
  },

  /**
   * MCP Server Configuration
   * Model Context Protocol server for external tool integration
   */
  mcpServers: {
    githubMCPServer, // Exposes GitHub tools and agents via MCP
  },

  /**
   * Storage Configuration
   * Persistent storage for telemetry, evaluations, and session data
   *
   * Note: Currently using in-memory storage for development.
   * For production, change to file:../mastra.db for persistence
   */
  storage: new LibSQLStore({
    url: ":memory:", // In-memory storage for development
  }),

  /**
   * Logger Configuration
   * Structured logging using Pino for performance and observability
   */
  logger: new PinoLogger({
    name: "Mastra",
    level: "info", // Log level: error, warn, info, debug, trace
  }),
});
