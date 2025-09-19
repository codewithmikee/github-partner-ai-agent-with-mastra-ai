// src/mastra/tools/github-security.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { GitHubService } from "../../lib/github-service";

const githubService = new GitHubService();

export const securityScanTool = createTool({
  id: "security_scan",
  description:
    "Perform security analysis on a repository to identify potential vulnerabilities",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner username"),
    repo: z.string().describe("Repository name"),
    scanType: z
      .enum(["basic", "comprehensive"])
      .default("basic")
      .describe("Type of security scan to perform"),
  }),
  execute: async ({ context }) => {
    const { owner, repo, scanType } = context;

    try {
      const repos = await githubService.getAllRepositories();
      const repository = repos.find(
        (r: any) => r.name === repo && r.username === owner
      );

      if (!repository) {
        throw new Error(
          `Repository ${owner}/${repo} not found or not accessible`
        );
      }

      // Get repository structure for analysis
      const structure = await githubService.getRepositoryStructure(owner, repo);

      // Security analysis
      const securityIssues: Array<{
        type: string;
        severity: "low" | "medium" | "high" | "critical";
        description: string;
        file?: string;
        recommendation: string;
      }> = [];

      // Check for sensitive files
      const sensitiveFiles = structure.files.filter(
        (file: any) =>
          file.name.includes(".env") ||
          file.name.includes("secret") ||
          file.name.includes("key") ||
          file.name.includes("password") ||
          file.name.includes("token")
      );

      sensitiveFiles.forEach((file: any) => {
        securityIssues.push({
          type: "sensitive_file",
          severity: "high",
          description: `Potentially sensitive file found: ${file.name}`,
          file: file.path,
          recommendation:
            "Ensure sensitive files are in .gitignore and never committed to version control",
        });
      });

      // Check for hardcoded secrets in package.json
      structure.packageJsons.forEach((pkg: any) => {
        const pkgStr = JSON.stringify(pkg);
        if (
          pkgStr.includes("password") ||
          pkgStr.includes("secret") ||
          pkgStr.includes("token")
        ) {
          securityIssues.push({
            type: "hardcoded_secret",
            severity: "critical",
            description: "Potential hardcoded secrets found in package.json",
            recommendation:
              "Use environment variables for sensitive configuration",
          });
        }
      });

      // Check for missing security configurations
      const hasSecurityConfig = structure.files.some(
        (file: any) =>
          file.name.includes("security") ||
          file.name.includes(".security") ||
          file.name.includes("csp")
      );

      if (!hasSecurityConfig) {
        securityIssues.push({
          type: "missing_security_config",
          severity: "medium",
          description: "No security configuration files found",
          recommendation:
            "Add security headers, CSP policies, and other security configurations",
        });
      }

      // Check for outdated dependencies (basic check)
      structure.packageJsons.forEach((pkg: any) => {
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const outdatedDeps: string[] = [];

        // Simple outdated dependency detection (in real implementation, use a proper vulnerability scanner)
        Object.entries(deps).forEach(([name, version]) => {
          if (
            typeof version === "string" &&
            version.includes("^") &&
            name.includes("old")
          ) {
            outdatedDeps.push(name);
          }
        });

        if (outdatedDeps.length > 0) {
          securityIssues.push({
            type: "outdated_dependencies",
            severity: "medium",
            description: `Potentially outdated dependencies: ${outdatedDeps.join(
              ", "
            )}`,
            recommendation:
              "Update dependencies to latest secure versions and run vulnerability scans",
          });
        }
      });

      // Check for missing HTTPS enforcement
      const hasHttpsConfig = structure.files.some(
        (file: any) =>
          file.content &&
          (file.content.includes("https://") ||
            file.content.includes("secure: true") ||
            file.content.includes("ssl: true"))
      );

      if (!hasHttpsConfig) {
        securityIssues.push({
          type: "missing_https",
          severity: "medium",
          description: "No HTTPS enforcement configuration found",
          recommendation:
            "Ensure all connections use HTTPS and implement proper SSL/TLS configuration",
        });
      }

      // Calculate security score
      const criticalIssues = securityIssues.filter(
        (issue) => issue.severity === "critical"
      ).length;
      const highIssues = securityIssues.filter(
        (issue) => issue.severity === "high"
      ).length;
      const mediumIssues = securityIssues.filter(
        (issue) => issue.severity === "medium"
      ).length;
      const lowIssues = securityIssues.filter(
        (issue) => issue.severity === "low"
      ).length;

      const securityScore = Math.max(
        0,
        100 -
          criticalIssues * 25 -
          highIssues * 15 -
          mediumIssues * 10 -
          lowIssues * 5
      );

      // Generate security recommendations
      const recommendations = generateSecurityRecommendations(securityIssues);

      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          url: repository.url,
        },
        securityAnalysis: {
          score: securityScore,
          totalIssues: securityIssues.length,
          issuesBySeverity: {
            critical: criticalIssues,
            high: highIssues,
            medium: mediumIssues,
            low: lowIssues,
          },
          issues: securityIssues,
          recommendations,
        },
        scanType,
        scanDate: new Date().toISOString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to perform security scan: ${error.message}`);
    }
  },
});

export const dependencyAnalysisTool = createTool({
  id: "dependency_analysis",
  description:
    "Analyze project dependencies for security vulnerabilities and outdated packages",
  inputSchema: z.object({
    owner: z.string().describe("Repository owner username"),
    repo: z.string().describe("Repository name"),
  }),
  execute: async ({ context }) => {
    const { owner, repo } = context;

    try {
      const repos = await githubService.getAllRepositories();
      const repository = repos.find(
        (r: any) => r.name === repo && r.username === owner
      );

      if (!repository) {
        throw new Error(
          `Repository ${owner}/${repo} not found or not accessible`
        );
      }

      // Get repository structure for analysis
      const structure = await githubService.getRepositoryStructure(owner, repo);

      const dependencyAnalysis = {
        packageManagers: structure.packageJsons.map((pkg: any) => ({
          name: pkg.name,
          version: pkg.version,
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {}),
          totalDependencies:
            Object.keys(pkg.dependencies || {}).length +
            Object.keys(pkg.devDependencies || {}).length,
        })),
        analysis: {
          hasDependencies: structure.packageJsons.length > 0,
          totalPackages: structure.packageJsons.reduce(
            (total: number, pkg: any) =>
              total +
              Object.keys(pkg.dependencies || {}).length +
              Object.keys(pkg.devDependencies || {}).length,
            0
          ),
          commonFrameworks: detectCommonFrameworks(structure),
          securityConcerns: detectSecurityConcerns(structure),
          maintenanceStatus: assessMaintenanceStatus(structure),
        },
      };

      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          url: repository.url,
        },
        dependencyAnalysis,
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze dependencies: ${error.message}`);
    }
  },
});

function generateSecurityRecommendations(issues: any[]): string[] {
  const recommendations: string[] = [];

  const criticalIssues = issues.filter(
    (issue) => issue.severity === "critical"
  );
  const highIssues = issues.filter((issue) => issue.severity === "high");

  if (criticalIssues.length > 0) {
    recommendations.push(
      "🚨 CRITICAL: Address critical security issues immediately"
    );
  }

  if (highIssues.length > 0) {
    recommendations.push("⚠️ HIGH: Fix high-priority security vulnerabilities");
  }

  if (issues.some((issue) => issue.type === "sensitive_file")) {
    recommendations.push(
      "🔐 Remove sensitive files from version control and add to .gitignore"
    );
  }

  if (issues.some((issue) => issue.type === "hardcoded_secret")) {
    recommendations.push(
      "🔑 Replace hardcoded secrets with environment variables"
    );
  }

  if (issues.some((issue) => issue.type === "outdated_dependencies")) {
    recommendations.push("📦 Update dependencies to latest secure versions");
  }

  if (issues.some((issue) => issue.type === "missing_security_config")) {
    recommendations.push("🛡️ Implement security headers and configurations");
  }

  if (issues.some((issue) => issue.type === "missing_https")) {
    recommendations.push("🔒 Enforce HTTPS for all connections");
  }

  recommendations.push(
    "🔍 Run regular security audits and vulnerability scans"
  );
  recommendations.push(
    "📚 Implement security best practices and coding standards"
  );

  return recommendations;
}

function detectCommonFrameworks(structure: any): string[] {
  const frameworks: string[] = [];

  structure.packageJsons.forEach((pkg: any) => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    Object.keys(deps).forEach((dep) => {
      if (dep.includes("react")) frameworks.push("React");
      if (dep.includes("vue")) frameworks.push("Vue.js");
      if (dep.includes("angular")) frameworks.push("Angular");
      if (dep.includes("express")) frameworks.push("Express.js");
      if (dep.includes("fastify")) frameworks.push("Fastify");
      if (dep.includes("next")) frameworks.push("Next.js");
      if (dep.includes("nuxt")) frameworks.push("Nuxt.js");
    });
  });

  return [...new Set(frameworks)];
}

function detectSecurityConcerns(structure: any): string[] {
  const concerns: string[] = [];

  structure.packageJsons.forEach((pkg: any) => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Check for potentially vulnerable packages
    Object.keys(deps).forEach((dep) => {
      if (dep.includes("jquery") && deps[dep].includes("1.")) {
        concerns.push("Outdated jQuery version detected");
      }
      if (dep.includes("lodash") && deps[dep].includes("3.")) {
        concerns.push("Outdated Lodash version detected");
      }
    });
  });

  return concerns;
}

function assessMaintenanceStatus(structure: any): string {
  const packageCount = structure.packageJsons.length;

  if (packageCount === 0) {
    return "No package management detected";
  }

  if (packageCount === 1) {
    return "Single package configuration";
  }

  return "Multiple package configurations detected";
}
