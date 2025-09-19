// src/mastra/tools/github-advanced.ts
import { createTool } from "@mastra/core";
import { z } from "zod";
import { GitHubService } from "../../lib/github-service";

const githubService = new GitHubService();

export const getRepositoryMetricsTool = createTool({
  id: "get_repository_metrics",
  description: "Get comprehensive metrics and statistics for a repository",
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

      // Calculate additional metrics
      const metrics = {
        basic: {
          stars: repository.stars,
          forks: repository.forks,
          size: repository.size,
          language: repository.language,
          topics: repository.topics,
          license: repository.license,
          private: repository.private,
        },
        activity: {
          createdAt: repository.createdAt,
          updatedAt: repository.updatedAt,
          daysSinceCreated: Math.floor(
            (Date.now() - new Date(repository.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          daysSinceUpdated: Math.floor(
            (Date.now() - new Date(repository.updatedAt).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
        popularity: {
          starsPerDay:
            repository.stars /
            Math.max(
              1,
              Math.floor(
                (Date.now() - new Date(repository.createdAt).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            ),
          engagementScore:
            (repository.stars * 2 + repository.forks) /
            Math.max(1, repository.size / 1000),
          trending:
            repository.stars > 100 &&
            Date.now() - new Date(repository.updatedAt).getTime() <
              7 * 24 * 60 * 60 * 1000, // Updated in last 7 days
        },
        quality: {
          hasDescription: !!repository.description,
          hasTopics: repository.topics.length > 0,
          hasLicense: !!repository.license,
          hasReadme: false, // Would need to check file structure
          documentationScore:
            (repository.description ? 1 : 0) +
            (repository.topics.length > 0 ? 1 : 0) +
            (repository.license ? 1 : 0),
        },
      };

      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          url: repository.url,
        },
        metrics,
      };
    } catch (error: any) {
      throw new Error(`Failed to get repository metrics: ${error.message}`);
    }
  },
});

export const searchRepositoriesTool = createTool({
  id: "search_repositories",
  description:
    "Search repositories with advanced filtering and sorting options",
  inputSchema: z.object({
    query: z
      .string()
      .optional()
      .describe("Search query for repository names or descriptions"),
    language: z.string().optional().describe("Filter by programming language"),
    minStars: z.number().min(0).optional().describe("Minimum number of stars"),
    maxStars: z.number().min(0).optional().describe("Maximum number of stars"),
    minForks: z.number().min(0).optional().describe("Minimum number of forks"),
    hasLicense: z.boolean().optional().describe("Filter by license presence"),
    isPrivate: z.boolean().optional().describe("Filter by privacy status"),
    sortBy: z
      .enum(["stars", "forks", "updated", "created", "name"])
      .default("stars"),
    limit: z.number().min(1).max(100).default(20),
  }),
  execute: async ({ context }) => {
    const {
      query,
      language,
      minStars,
      maxStars,
      minForks,
      hasLicense,
      isPrivate,
      sortBy,
      limit,
    } = context;

    try {
      let repos = await githubService.getAllRepositories();

      // Apply filters
      if (query) {
        const searchTerm = query.toLowerCase();
        repos = repos.filter(
          (repo: any) =>
            repo.name.toLowerCase().includes(searchTerm) ||
            (repo.description &&
              repo.description.toLowerCase().includes(searchTerm))
        );
      }

      if (language) {
        repos = repos.filter(
          (repo: any) => repo.language?.toLowerCase() === language.toLowerCase()
        );
      }

      if (minStars !== undefined) {
        repos = repos.filter((repo: any) => repo.stars >= minStars);
      }

      if (maxStars !== undefined) {
        repos = repos.filter((repo: any) => repo.stars <= maxStars);
      }

      if (minForks !== undefined) {
        repos = repos.filter((repo: any) => repo.forks >= minForks);
      }

      if (hasLicense !== undefined) {
        repos = repos.filter((repo: any) =>
          hasLicense ? !!repo.license : !repo.license
        );
      }

      if (isPrivate !== undefined) {
        repos = repos.filter((repo: any) => repo.private === isPrivate);
      }

      // Sort results
      repos.sort((a: any, b: any) => {
        switch (sortBy) {
          case "stars":
            return b.stars - a.stars;
          case "forks":
            return b.forks - a.forks;
          case "updated":
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          case "created":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      // Limit results
      repos = repos.slice(0, limit);

      return {
        repositories: repos.map((repo: any) => ({
          name: repo.name,
          fullName: repo.fullName,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          forks: repo.forks,
          size: repo.size,
          updatedAt: repo.updatedAt,
          url: repo.url,
          topics: repo.topics,
          license: repo.license,
          private: repo.private,
        })),
        total: repos.length,
        filters: {
          query,
          language,
          minStars,
          maxStars,
          minForks,
          hasLicense,
          isPrivate,
          sortBy,
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to search repositories: ${error.message}`);
    }
  },
});

export const getCodeQualityTool = createTool({
  id: "get_code_quality",
  description: "Analyze code quality metrics and patterns for a repository",
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

      // Analyze code quality indicators
      const qualityMetrics = {
        structure: {
          fileCount: structure.files.length,
          directoryCount: structure.directories.length,
          languageDistribution: structure.languages,
          hasConfigFiles: structure.configs.length > 0,
          hasPackageJson: structure.packageJsons.length > 0,
        },
        organization: {
          hasComponents: structure.directories.some(
            (dir: string) =>
              dir.includes("components") || dir.includes("component")
          ),
          hasTests: structure.files.some(
            (file: any) =>
              file.name.includes("test") || file.name.includes("spec")
          ),
          hasDocs: structure.readmes.length > 0,
          hasUtils: structure.directories.some(
            (dir: string) => dir.includes("utils") || dir.includes("helpers")
          ),
          hasTypes: structure.directories.some(
            (dir: string) => dir.includes("types") || dir.includes("interfaces")
          ),
        },
        modernPractices: {
          usesTypeScript:
            Object.keys(structure.languages).includes("ts") ||
            Object.keys(structure.languages).includes("tsx"),
          hasESLint: structure.files.some(
            (file: any) =>
              file.name.includes(".eslintrc") ||
              file.name.includes("eslint.config")
          ),
          hasPrettier: structure.files.some(
            (file: any) =>
              file.name.includes(".prettierrc") ||
              file.name.includes("prettier.config")
          ),
          hasGitHooks: structure.files.some(
            (file: any) =>
              file.name.includes("husky") || file.name.includes(".husky")
          ),
          hasCI: structure.files.some(
            (file: any) =>
              file.name.includes(".github/workflows") ||
              file.name.includes(".gitlab-ci") ||
              file.name.includes("circleci")
          ),
        },
        documentation: {
          hasReadme: structure.readmes.length > 0,
          hasChangelog: structure.files.some((file: any) =>
            file.name.toLowerCase().includes("changelog")
          ),
          hasContributing: structure.files.some((file: any) =>
            file.name.toLowerCase().includes("contributing")
          ),
          hasLicense: structure.files.some((file: any) =>
            file.name.toLowerCase().includes("license")
          ),
        },
      };

      // Calculate overall quality score
      let qualityScore = 0;
      let maxScore = 0;

      // Structure score (0-3)
      maxScore += 3;
      if (qualityMetrics.structure.fileCount > 10) qualityScore += 1;
      if (qualityMetrics.structure.hasConfigFiles) qualityScore += 1;
      if (qualityMetrics.structure.hasPackageJson) qualityScore += 1;

      // Organization score (0-5)
      maxScore += 5;
      Object.values(qualityMetrics.organization).forEach((hasFeature) => {
        if (hasFeature) qualityScore += 1;
      });

      // Modern practices score (0-5)
      maxScore += 5;
      Object.values(qualityMetrics.modernPractices).forEach((hasFeature) => {
        if (hasFeature) qualityScore += 1;
      });

      // Documentation score (0-4)
      maxScore += 4;
      Object.values(qualityMetrics.documentation).forEach((hasFeature) => {
        if (hasFeature) qualityScore += 1;
      });

      const overallScore = maxScore > 0 ? (qualityScore / maxScore) * 100 : 0;

      return {
        repository: {
          name: repository.name,
          fullName: repository.fullName,
          url: repository.url,
        },
        qualityMetrics,
        overallScore: Math.round(overallScore),
        recommendations: generateRecommendations(qualityMetrics),
      };
    } catch (error: any) {
      throw new Error(`Failed to analyze code quality: ${error.message}`);
    }
  },
});

function generateRecommendations(metrics: any): string[] {
  const recommendations: string[] = [];

  if (!metrics.organization.hasTests) {
    recommendations.push("Add unit tests to improve code reliability");
  }

  if (
    !metrics.modernPractices.usesTypeScript &&
    metrics.structure.languageDistribution.js
  ) {
    recommendations.push(
      "Consider migrating to TypeScript for better type safety"
    );
  }

  if (!metrics.modernPractices.hasESLint) {
    recommendations.push("Add ESLint for code quality enforcement");
  }

  if (!metrics.modernPractices.hasPrettier) {
    recommendations.push("Add Prettier for consistent code formatting");
  }

  if (!metrics.modernPractices.hasCI) {
    recommendations.push(
      "Set up CI/CD pipeline for automated testing and deployment"
    );
  }

  if (!metrics.documentation.hasReadme) {
    recommendations.push("Add a comprehensive README file");
  }

  if (!metrics.documentation.hasLicense) {
    recommendations.push("Add a license file to clarify usage terms");
  }

  return recommendations;
}
