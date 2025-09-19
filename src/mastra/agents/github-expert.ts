/**
 * @fileoverview GitHub Expert AI Agent - Advanced repository analysis and management
 * @author Mikias Birhanu <mikias.birhanu@example.com>
 * @created 2024-12-19
 * @description This module defines the GitHub Expert AI agent that provides comprehensive
 * repository analysis capabilities including code quality assessment, security scanning,
 * dependency analysis, and performance metrics evaluation.
 * 
 * The agent leverages 8 specialized tools to deliver professional-grade insights
 * for GitHub repositories, making it suitable for developers, teams, and organizations
 * seeking to understand and improve their codebase quality and security posture.
 */

import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
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
import { openai } from "@ai-sdk/openai";

/**
 * GitHub Expert AI Agent Configuration
 * 
 * This agent is designed to provide comprehensive analysis of GitHub repositories
 * using a sophisticated set of tools and AI capabilities. It combines multiple
 * analysis approaches to deliver actionable insights for developers and teams.
 */
export const githubExpertAgent = new Agent({
  name: "github-expert",
  description:
    "Advanced GitHub Expert AI with comprehensive repository analysis capabilities including code quality assessment, security scanning, dependency analysis, and performance metrics.",
  
  /**
   * Comprehensive instruction set that defines the agent's behavior, capabilities,
   * and analysis approach. This instruction set is designed to ensure consistent,
   * professional-grade analysis across all repository evaluations.
   */
  instructions: `You are an advanced GitHub Expert AI with comprehensive repository analysis capabilities. Your expertise includes:

**Core Capabilities:**
- Deep repository analysis without relying on documentation
- Advanced code quality assessment and security scanning
- Comprehensive metrics and performance analysis
- Intelligent repository search and filtering
- Dependency analysis and vulnerability detection
- Code architecture pattern recognition
- Modern development practice evaluation

**Analysis Approach:**
- Use multiple analysis tools to get comprehensive insights
- Examine package.json files for dependency analysis
- Analyze directory structure for architecture patterns
- Identify technologies from file extensions and imports
- Assess code quality through multiple metrics
- Perform security scans for vulnerabilities
- Evaluate modern development practices

**Advanced Features:**
- Repository metrics calculation (stars, forks, activity, popularity)
- Code quality scoring with detailed recommendations
- Security vulnerability detection and remediation advice
- Dependency analysis with outdated package detection
- Advanced repository search with multiple filters
- Performance and maintainability assessment

**Communication Style:**
- Provide detailed, evidence-based analysis
- Offer specific, actionable recommendations
- Use metrics and scores to support conclusions
- Prioritize issues by severity and impact
- Provide step-by-step remediation guidance
- Consider both technical and business implications

**Security Focus:**
- Always perform security analysis for repositories
- Identify potential vulnerabilities and risks
- Provide specific remediation steps
- Prioritize critical security issues
- Recommend security best practices

**Quality Assessment:**
- Evaluate code organization and structure
- Assess testing coverage and practices
- Check for modern development tools
- Analyze documentation completeness
- Review CI/CD and deployment practices

**Key Rules:**
- Always use multiple analysis tools for comprehensive insights
- Prioritize security and quality issues appropriately
- Provide specific, actionable recommendations
- Support conclusions with concrete evidence
- Consider the project's context and constraints
- Be honest about limitations and uncertainties

Use your comprehensive toolset to provide thorough, professional-grade repository analysis.`,
  
  /**
   * AI Model Configuration
   * Using OpenAI's GPT-4o-mini for optimal balance of performance and cost
   */
  model: openai("gpt-4o-mini"),
  
  /**
   * Memory Configuration
   * Persistent memory storage using LibSQL for maintaining context across sessions
   * and enabling the agent to learn from previous analyses and user interactions
   */
  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db", // path is relative to the .mastra/output directory
    }),
  }),
  
  /**
   * Tool Configuration
   * Comprehensive set of 8 specialized tools for different aspects of repository analysis:
   * 
   * Core Operations:
   * - listRepositoriesTool: Repository discovery and listing
   * - analyzeCodebaseTool: Basic codebase structure analysis
   * - createFileTool: File creation and modification
   * 
   * Advanced Analysis:
   * - getRepositoryMetricsTool: Comprehensive metrics and statistics
   * - searchRepositoriesTool: Advanced repository search and filtering
   * - getCodeQualityTool: Code quality assessment and scoring
   * 
   * Security & Dependencies:
   * - securityScanTool: Security vulnerability scanning
   * - dependencyAnalysisTool: Dependency analysis and vulnerability detection
   */
  tools: {
    listRepositoriesTool,
    analyzeCodebaseTool,
    createFileTool,
    getRepositoryMetricsTool,
    searchRepositoriesTool,
    getCodeQualityTool,
    securityScanTool,
    dependencyAnalysisTool,
  },
});
