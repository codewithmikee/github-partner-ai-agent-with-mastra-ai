// src/mastra/tools/github-analyzer.ts
import { createTool } from "@mastra/core"
import { z } from "zod"
import { GitHubService } from "../../lib/github-service"
import { CodeAnalyzer } from "../../lib/code-analyzer"

const githubService = new GitHubService()
const codeAnalyzer = new CodeAnalyzer()

export const analyzeCodebaseTool = createTool({
	id: "analyze_codebase",
	description:
		"Analyze repository structure and codebase without relying on README files",
	inputSchema: z.object({
		owner: z.string().describe("Repository owner username"),
		repo: z.string().describe("Repository name"),
		maxDepth: z
			.number()
			.min(1)
			.max(5)
			.default(3)
			.describe("Maximum directory depth to analyze"),
	}),
	execute: async ({ context }) => {
		const { owner, repo, maxDepth } = context

		try {
			// Get repository info
			const repos = await githubService.getAllRepositories()
			const repository = repos.find(
				(r: any) => r.name === repo && r.username === owner,
			)

			if (!repository) {
				throw new Error(
					`Repository ${owner}/${repo} not found or not accessible`,
				)
			}

			// Get detailed structure
			const structure = await githubService.getRepositoryStructure(owner, repo)

			// Analyze the codebase
			const analysis = codeAnalyzer.analyzeCodebase(repository, structure)

			return {
				repository: {
					name: analysis.repository.name,
					fullName: analysis.repository.fullName,
					description: analysis.repository.description,
					language: analysis.repository.language,
					stars: analysis.repository.stars,
					forks: analysis.repository.forks,
					size: analysis.repository.size,
					topics: analysis.repository.topics,
					private: analysis.repository.private,
				},
				analysis: {
					mainPurpose: analysis.mainPurpose,
					complexity: analysis.complexity,
					frameworks: analysis.frameworks,
					technologies: analysis.technologies,
					patterns: analysis.patterns,
					keyFeatures: analysis.keyFeatures,
				},
				structure: {
					fileCount: analysis.structure.files.length,
					directoryCount: analysis.structure.directories.length,
					languages: analysis.structure.languages,
					hasConfigs: analysis.structure.configs.length > 0,
					packageManagers: analysis.structure.packageJsons.map((pkg: any) => ({
						name: pkg.name,
						version: pkg.version,
						dependencies: Object.keys(pkg.dependencies || {}),
						devDependencies: Object.keys(pkg.devDependencies || {}),
					})),
				},
				insights: {
					isWellStructured: analysis.structure.directories.length > 3,
					hasTests: analysis.patterns.includes("Unit Testing"),
					hasDocumentation: analysis.structure.readmes.length > 0,
					modernStack: analysis.technologies.includes("TypeScript"),
				},
			}
		} catch (error: any) {
			throw new Error(`Failed to analyze codebase: ${error.message}`)
		}
	},
})
