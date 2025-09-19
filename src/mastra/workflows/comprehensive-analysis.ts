// src/mastra/workflows/comprehensive-analysis.ts
import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { RuntimeContext } from "@mastra/core/di";
import {
  listRepositoriesTool,
  analyzeCodebaseTool,
  getRepositoryMetricsTool,
  getCodeQualityTool,
  securityScanTool,
  dependencyAnalysisTool,
} from "../tools";

// Define schemas
const comprehensiveAnalysisInputSchema = z.object({
  owner: z.string().describe("Repository owner username"),
  repo: z.string().describe("Repository name"),
  includeSecurity: z
    .boolean()
    .default(true)
    .describe("Include security analysis"),
  includeQuality: z
    .boolean()
    .default(true)
    .describe("Include code quality analysis"),
  includeMetrics: z
    .boolean()
    .default(true)
    .describe("Include repository metrics"),
  includeDependencies: z
    .boolean()
    .default(true)
    .describe("Include dependency analysis"),
});

const repositoryFoundSchema = z.object({
  repository: z.any().describe("Repository information"),
  found: z.boolean().describe("Whether repository was found"),
});

const basicAnalysisSchema = z.object({
  repository: z.any().describe("Repository details"),
  analysis: z.any().describe("Basic code analysis results"),
  structure: z.any().describe("Project structure information"),
  insights: z.any().describe("Development insights"),
});

const metricsSchema = z.object({
  repository: z.any().describe("Repository details"),
  metrics: z.any().describe("Repository metrics and statistics"),
});

const qualitySchema = z.object({
  repository: z.any().describe("Repository details"),
  qualityMetrics: z.any().describe("Code quality metrics"),
  overallScore: z.number().describe("Overall quality score"),
  recommendations: z
    .array(z.string())
    .describe("Quality improvement recommendations"),
});

const securitySchema = z.object({
  repository: z.any().describe("Repository details"),
  securityAnalysis: z.any().describe("Security analysis results"),
  scanType: z.string().describe("Type of security scan performed"),
  scanDate: z.string().describe("Date of security scan"),
});

const dependencySchema = z.object({
  repository: z.any().describe("Repository details"),
  dependencyAnalysis: z.any().describe("Dependency analysis results"),
});

const comprehensiveReportSchema = z.object({
  repository: z.any().describe("Repository information"),
  summary: z
    .object({
      overallHealth: z
        .string()
        .describe("Overall repository health assessment"),
      criticalIssues: z.number().describe("Number of critical issues found"),
      recommendations: z.array(z.string()).describe("Priority recommendations"),
      score: z.number().describe("Overall repository score"),
    })
    .describe("Executive summary"),
  analysis: z
    .object({
      basic: z.any().optional().describe("Basic code analysis"),
      metrics: z.any().optional().describe("Repository metrics"),
      quality: z.any().optional().describe("Code quality analysis"),
      security: z.any().optional().describe("Security analysis"),
      dependencies: z.any().optional().describe("Dependency analysis"),
    })
    .describe("Detailed analysis results"),
  recommendations: z
    .array(
      z.object({
        priority: z
          .enum(["low", "medium", "high", "critical"])
          .describe("Recommendation priority"),
        category: z.string().describe("Recommendation category"),
        description: z.string().describe("Recommendation description"),
        action: z.string().describe("Specific action to take"),
      })
    )
    .describe("Prioritized recommendations"),
});

// Step 1: Find repository
const findRepositoryStep = createStep({
  id: "find-repository",
  description: "Locate the target repository in available GitHub accounts",
  inputSchema: comprehensiveAnalysisInputSchema,
  outputSchema: repositoryFoundSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("🔍 Executing Step: find-repository");
    const { owner, repo } = inputData;

    try {
      const result = await listRepositoriesTool.execute!({
        context: { limit: 100, sortBy: "updated", includePrivate: false },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      const repository = (result as any).repositories.find(
        (r: any) => r.name === repo && r.username === owner
      );

      console.log(
        `✅ Step find-repository: ${
          repository ? "Found" : "Not found"
        } repository ${owner}/${repo}`
      );

      return {
        repository: repository || null,
        found: !!repository,
      };
    } catch (error: any) {
      console.error("❌ Step find-repository: Failed -", error.message);
      return { repository: null, found: false };
    }
  },
});

// Step 2: Basic code analysis
const basicAnalysisStep = createStep({
  id: "basic-analysis",
  description: "Perform basic codebase structure and technology analysis",
  inputSchema: repositoryFoundSchema.extend({
    owner: z.string(),
    repo: z.string(),
  }),
  outputSchema: basicAnalysisSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("🔍 Executing Step: basic-analysis");
    const { owner, repo, found } = inputData;

    if (!found) {
      throw new Error(`Repository ${owner}/${repo} not found`);
    }

    try {
      const result = await analyzeCodebaseTool.execute!({
        context: { owner, repo, maxDepth: 3 },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(
        `✅ Step basic-analysis: Completed analysis for ${owner}/${repo}`
      );

      return {
        repository: (result as any).repository,
        analysis: (result as any).analysis,
        structure: (result as any).structure,
        insights: (result as any).insights,
      };
    } catch (error: any) {
      console.error("❌ Step basic-analysis: Failed -", error.message);
      throw error;
    }
  },
});

// Step 3: Repository metrics (optional)
const metricsStep = createStep({
  id: "repository-metrics",
  description: "Calculate comprehensive repository metrics and statistics",
  inputSchema: basicAnalysisSchema.extend({
    includeMetrics: z.boolean(),
  }),
  outputSchema: metricsSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("📊 Executing Step: repository-metrics");
    const { includeMetrics, repository } = inputData;

    if (!includeMetrics) {
      console.log(
        "⏭️ Step repository-metrics: Skipped - Metrics not requested"
      );
      return {
        repository,
        metrics: null,
      };
    }

    try {
      const result = await getRepositoryMetricsTool.execute!({
        context: {
          owner: repository.username,
          repo: repository.name,
        },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(`✅ Step repository-metrics: Completed metrics calculation`);

      return {
        repository: (result as any).repository,
        metrics: (result as any).metrics,
      };
    } catch (error: any) {
      console.error("❌ Step repository-metrics: Failed -", error.message);
      return {
        repository,
        metrics: null,
      };
    }
  },
});

// Step 4: Code quality analysis (optional)
const qualityStep = createStep({
  id: "code-quality",
  description: "Analyze code quality metrics and patterns",
  inputSchema: metricsSchema.extend({
    includeQuality: z.boolean(),
  }),
  outputSchema: qualitySchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("🔍 Executing Step: code-quality");
    const { includeQuality, repository } = inputData;

    if (!includeQuality) {
      console.log(
        "⏭️ Step code-quality: Skipped - Quality analysis not requested"
      );
      return {
        repository,
        qualityMetrics: null,
        overallScore: 0,
        recommendations: [],
      };
    }

    try {
      const result = await getCodeQualityTool.execute!({
        context: {
          owner: repository.username,
          repo: repository.name,
        },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(`✅ Step code-quality: Completed quality analysis`);

      return {
        repository: (result as any).repository,
        qualityMetrics: (result as any).qualityMetrics,
        overallScore: (result as any).overallScore,
        recommendations: (result as any).recommendations,
      };
    } catch (error: any) {
      console.error("❌ Step code-quality: Failed -", error.message);
      return {
        repository,
        qualityMetrics: null,
        overallScore: 0,
        recommendations: [],
      };
    }
  },
});

// Step 5: Security analysis (optional)
const securityStep = createStep({
  id: "security-analysis",
  description: "Perform security vulnerability scanning",
  inputSchema: qualitySchema.extend({
    includeSecurity: z.boolean(),
  }),
  outputSchema: securitySchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("🔒 Executing Step: security-analysis");
    const { includeSecurity, repository } = inputData;

    if (!includeSecurity) {
      console.log(
        "⏭️ Step security-analysis: Skipped - Security analysis not requested"
      );
      return {
        repository,
        securityAnalysis: null,
        scanType: "skipped",
        scanDate: new Date().toISOString(),
      };
    }

    try {
      const result = await securityScanTool.execute!({
        context: {
          owner: repository.username,
          repo: repository.name,
          scanType: "comprehensive",
        },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(`✅ Step security-analysis: Completed security scan`);

      return {
        repository: (result as any).repository,
        securityAnalysis: (result as any).securityAnalysis,
        scanType: (result as any).scanType,
        scanDate: (result as any).scanDate,
      };
    } catch (error: any) {
      console.error("❌ Step security-analysis: Failed -", error.message);
      return {
        repository,
        securityAnalysis: null,
        scanType: "failed",
        scanDate: new Date().toISOString(),
      };
    }
  },
});

// Step 6: Dependency analysis (optional)
const dependencyStep = createStep({
  id: "dependency-analysis",
  description: "Analyze project dependencies and vulnerabilities",
  inputSchema: securitySchema.extend({
    includeDependencies: z.boolean(),
  }),
  outputSchema: dependencySchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("📦 Executing Step: dependency-analysis");
    const { includeDependencies, repository } = inputData;

    if (!includeDependencies) {
      console.log(
        "⏭️ Step dependency-analysis: Skipped - Dependency analysis not requested"
      );
      return {
        repository,
        dependencyAnalysis: null,
      };
    }

    try {
      const result = await dependencyAnalysisTool.execute!({
        context: {
          owner: repository.username,
          repo: repository.name,
        },
        mastra,
        runtimeContext: runtimeContext || new RuntimeContext(),
      });

      console.log(`✅ Step dependency-analysis: Completed dependency analysis`);

      return {
        repository: (result as any).repository,
        dependencyAnalysis: (result as any).dependencyAnalysis,
      };
    } catch (error: any) {
      console.error("❌ Step dependency-analysis: Failed -", error.message);
      return {
        repository,
        dependencyAnalysis: null,
      };
    }
  },
});

// Step 7: Generate comprehensive report
const generateReportStep = createStep({
  id: "generate-report",
  description: "Generate comprehensive analysis report with recommendations",
  inputSchema: dependencySchema.extend({
    basic: z.any().optional(),
    metrics: z.any().optional(),
    quality: z.any().optional(),
    security: z.any().optional(),
    dependencies: z.any().optional(),
  }),
  outputSchema: comprehensiveReportSchema,
  execute: async ({ inputData, mastra, runtimeContext }) => {
    console.log("📋 Executing Step: generate-report");
    const { repository, basic, metrics, quality, security, dependencies } =
      inputData;

    try {
      // Calculate overall health score
      let totalScore = 0;
      let scoreCount = 0;

      if (quality?.overallScore) {
        totalScore += quality.overallScore;
        scoreCount++;
      }

      if (security?.securityAnalysis?.score) {
        totalScore += security.securityAnalysis.score;
        scoreCount++;
      }

      const overallScore =
        scoreCount > 0 ? Math.round(totalScore / scoreCount) : 50;

      // Determine overall health
      let overallHealth = "Unknown";
      if (overallScore >= 80) overallHealth = "Excellent";
      else if (overallScore >= 60) overallHealth = "Good";
      else if (overallScore >= 40) overallHealth = "Fair";
      else overallHealth = "Needs Improvement";

      // Count critical issues
      const criticalIssues =
        security?.securityAnalysis?.issuesBySeverity?.critical || 0;

      // Generate recommendations
      const recommendations: Array<{
        priority: "low" | "medium" | "high" | "critical";
        category: string;
        description: string;
        action: string;
      }> = [];

      // Security recommendations
      if (security?.securityAnalysis?.recommendations) {
        security.securityAnalysis.recommendations.forEach((rec: string) => {
          recommendations.push({
            priority: "high" as const,
            category: "Security",
            description: rec,
            action: rec,
          });
        });
      }

      // Quality recommendations
      if (quality?.recommendations) {
        quality.recommendations.forEach((rec: string) => {
          recommendations.push({
            priority: "medium" as const,
            category: "Code Quality",
            description: rec,
            action: rec,
          });
        });
      }

      // Basic analysis recommendations
      if (basic?.recommendations) {
        basic.recommendations.forEach((rec: string) => {
          recommendations.push({
            priority: "low" as const,
            category: "General",
            description: rec,
            action: rec,
          });
        });
      }

      // Sort recommendations by priority
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      recommendations.sort(
        (a, b) =>
          (priorityOrder as any)[b.priority] -
          (priorityOrder as any)[a.priority]
      );

      console.log(`✅ Step generate-report: Generated comprehensive report`);

      return {
        repository,
        summary: {
          overallHealth,
          criticalIssues,
          recommendations: recommendations
            .slice(0, 5)
            .map((r) => r.description),
          score: overallScore,
        },
        analysis: {
          basic: basic || null,
          metrics: metrics || null,
          quality: quality || null,
          security: security || null,
          dependencies: dependencies || null,
        },
        recommendations: recommendations.slice(0, 10), // Top 10 recommendations
      };
    } catch (error: any) {
      console.error("❌ Step generate-report: Failed -", error.message);
      throw error;
    }
  },
});

// Define the comprehensive analysis workflow
export const comprehensiveAnalysisWorkflow = createWorkflow({
  id: "comprehensive-analysis-workflow",
  description:
    "Performs comprehensive repository analysis including code quality, security, metrics, and dependencies",
  inputSchema: comprehensiveAnalysisInputSchema,
  outputSchema: comprehensiveReportSchema,
})
  .then(findRepositoryStep)
  .then(basicAnalysisStep as any)
  .then(metricsStep as any)
  .then(qualityStep as any)
  .then(securityStep as any)
  .then(dependencyStep as any)
  .then(generateReportStep as any)
  .commit();
