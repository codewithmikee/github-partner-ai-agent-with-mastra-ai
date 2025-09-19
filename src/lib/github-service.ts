/**
 * @fileoverview Enhanced GitHub Service - Robust API client with caching and rate limiting
 * @author Mikias Birhanu <mikias.birhanu@example.com>
 * @created 2024-12-19
 * @description This module provides a comprehensive GitHub API service with advanced features
 * including automatic retry mechanisms, intelligent throttling, response caching, and
 * multi-account support for high-volume repository analysis operations.
 * 
 * Key Features:
 * - Automatic retry with exponential backoff for failed requests
 * - Intelligent rate limiting to prevent API abuse
 * - Response caching with TTL for improved performance
 * - Multi-account support for parallel operations
 * - Comprehensive error handling and recovery
 */

import { Octokit } from "@octokit/rest";
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";
import type {
  GitHubAccount,
  Repository,
  FileContent,
  ProjectStructure,
} from "./types";

/**
 * Enhanced Octokit client with retry and throttling plugins
 * 
 * This configuration provides:
 * - Automatic retry for transient failures (network issues, rate limits)
 * - Intelligent throttling to respect GitHub's rate limits
 * - Exponential backoff for retry attempts
 * - Custom retry logic for different error types
 */
const EnhancedOctokit = Octokit.plugin(retry, throttling);

/**
 * Enhanced GitHub Service Class
 * 
 * Provides a robust, production-ready GitHub API client with advanced features
 * for high-volume repository analysis operations.
 */
export class GitHubService {
  /**
   * Account management - stores authenticated GitHub accounts
   * Key: account ID, Value: { account details, octokit instance }
   */
  private accounts: Map<string, { account: GitHubAccount; octokit: Octokit }> =
    new Map();
  
  /**
   * Response cache for improved performance
   * Key: cache key, Value: { data, timestamp }
   */
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  /**
   * Cache Time-To-Live: 5 minutes
   * Balances performance improvement with data freshness
   */
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Constructor - Initializes the service and sets up GitHub accounts
   */
  constructor() {
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    const accounts = [
      {
        id: "account1",
        username: process.env.GITHUB_USERNAME_1!,
        token: process.env.GITHUB_TOKEN_1!,
      },
      // {
      // 	id: "account2",
      // 	username: process.env.GITHUB_USERNAME_2!,
      // 	token: process.env.GITHUB_TOKEN_2!,
      // },
    ].filter((acc) => acc.username && acc.token);

    accounts.forEach((account) => {
      const octokit = new EnhancedOctokit({
        auth: account.token,
        throttle: {
          onRateLimit: (retryAfter, options, octokit) => {
            console.warn(
              `Rate limit exceeded for ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`
            );
            return true;
          },
          onSecondaryRateLimit: (retryAfter, options, octokit) => {
            console.warn(
              `Secondary rate limit exceeded for ${options.method} ${options.url}. Retrying after ${retryAfter} seconds.`
            );
            return true;
          },
        },
        retry: {
          doNotRetry: ["400", "401", "403", "404", "422"],
          retryAfterBaseValue: 1000,
          retries: 3,
        },
      });
      this.accounts.set(account.id, { account, octokit });
    });
  }

  async getAllRepositories(forceRefresh = false): Promise<Repository[]> {
    const cacheKey = "all_repositories";

    // Check cache first
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }
    }

    const allRepos: Repository[] = [];

    for (const [accountId, { account, octokit }] of this.accounts) {
      try {
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
          sort: "updated",
          per_page: 100,
          visibility: "all",
        });

        allRepos.push(
          ...(repos.map((repo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            size: repo.size,
            updatedAt: repo.updated_at,
            createdAt: repo.created_at,
            private: repo.private,
            url: repo.html_url,
            account: accountId,
            username: account.username,
            topics: repo.topics || [],
            license: repo.license?.name || null,
            defaultBranch: repo.default_branch,
          })) as any)
        );
      } catch (error: any) {
        console.error(`Error fetching repos for ${accountId}:`, error);
        // Continue with other accounts even if one fails
      }
    }

    // Cache the result
    this.cache.set(cacheKey, {
      data: allRepos,
      timestamp: Date.now(),
    });

    return allRepos;
  }

  async getRepositoryStructure(
    owner: string,
    repo: string
  ): Promise<ProjectStructure> {
    const account = this.getAccountByUsername(owner);
    if (!account) throw new Error(`Account not found for username: ${owner}`);

    const structure: ProjectStructure = {
      files: [],
      directories: [],
      languages: {},
      packageJsons: [],
      readmes: [],
      configs: [],
    };

    await this.traverseRepository(account.octokit, owner, repo, "", structure);

    return structure;
  }

  private async traverseRepository(
    octokit: Octokit,
    owner: string,
    repo: string,
    path: string,
    structure: ProjectStructure,
    maxDepth: number = 3,
    currentDepth: number = 0
  ): Promise<void> {
    if (currentDepth > maxDepth) return;

    try {
      const { data: contents } = await octokit.repos.getContent({
        owner,
        repo,
        path,
      });
      const items = Array.isArray(contents) ? contents : [contents];

      for (const item of items) {
        if (item.type === "dir") {
          structure.directories.push(item.path);
          await this.traverseRepository(
            octokit,
            owner,
            repo,
            item.path,
            structure,
            maxDepth,
            currentDepth + 1
          );
        } else if (item.type === "file") {
          const fileInfo: FileContent = {
            name: item.name,
            path: item.path,
            sha: item.sha,
            size: item.size,
            url: item.html_url ?? "",
            type: "file",
          };

          // Get file content for important files
          if (this.shouldFetchContent(item.name)) {
            try {
              const { data: fileData } = await octokit.repos.getContent({
                owner,
                repo,
                path: item.path,
              });

              if ("content" in fileData && fileData.content) {
                fileInfo.content = Buffer.from(
                  fileData.content,
                  "base64"
                ).toString();
                fileInfo.encoding = fileData.encoding;
              }
            } catch (error: any) {
              console.error(`Error fetching content for ${item.path}:`, error);
            }
          }

          structure.files.push(fileInfo);

          // Categorize special files
          const fileName = item.name.toLowerCase();
          if (fileName.includes("package.json") && fileInfo.content) {
            try {
              structure.packageJsons.push(JSON.parse(fileInfo.content));
            } catch (error: any) {
              console.error(
                `Error parsing package.json at ${item.path}:`,
                error
              );
            }
          }

          if (fileName.includes("readme")) {
            structure.readmes.push(fileInfo);
          }

          if (this.isConfigFile(fileName)) {
            structure.configs.push(fileInfo);
          }

          // Track languages by file extension
          const extension = this.getFileExtension(item.name);
          if (extension) {
            structure.languages[extension] =
              (structure.languages[extension] || 0) + 1;
          }
        }
      }
    } catch (error: any) {
      console.error(
        `Error traversing ${owner}/${repo}${path ? `/${path}` : ""}:`,
        error
      );
    }
  }

  private shouldFetchContent(fileName: string): boolean {
    const importantFiles = [
      "package.json",
      "tsconfig.json",
      "vite.config",
      "webpack.config",
      "readme.md",
      "readme.txt",
      ".env.example",
      "dockerfile",
      "docker-compose",
      "makefile",
      "cargo.toml",
      "go.mod",
      "requirements.txt",
      "pyproject.toml",
      "pom.xml",
      "build.gradle",
    ];

    const name = fileName.toLowerCase();
    return importantFiles.some((pattern) => name.includes(pattern));
  }

  private isConfigFile(fileName: string): boolean {
    const configPatterns = [
      "tsconfig",
      "vite.config",
      "webpack.config",
      "rollup.config",
      "jest.config",
      "cypress.config",
      "tailwind.config",
      "next.config",
      "nuxt.config",
      ".eslintrc",
      ".prettierrc",
      "babel.config",
    ];

    return configPatterns.some((pattern) => fileName.includes(pattern));
  }

  private getFileExtension(fileName: string): string | null {
    const parts = fileName.split(".");
    if (parts.length > 1) {
      return parts[parts.length - 1].toLowerCase();
    }
    return null;
  }

  private getAccountByUsername(
    username: string
  ): { account: GitHubAccount; octokit: Octokit } | null {
    for (const accountData of this.accounts.values()) {
      if (accountData.account.username === username) return accountData;
    }
    return null;
  }

  getAccounts(): GitHubAccount[] {
    return Array.from(this.accounts.values()).map(({ account }) => account);
  }
}
