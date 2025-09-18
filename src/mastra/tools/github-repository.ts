// src/mastra/tools/github-repository.ts
import { createTool } from "@mastra/core"
import { z } from "zod"
import { GitHubService } from "../../lib/github-service"

const githubService = new GitHubService()
export const listRepositoriesTool = createTool({
	id: "list_repositories",
	description:
		"List all repositories across GitHub accounts with filtering options",
	inputSchema: z.object({
		language: z.string().optional(),
		sortBy: z.enum(["updated", "created", "name", "stars"]).default("updated"),
		limit: z.number().min(1).max(100).default(50),
		includePrivate: z.boolean().default(true),
	}),

	execute: async ({ context, mastra, runtimeContext }) => {
		// Access parameters from context directly
		const { language, sortBy, limit, includePrivate } = context

		try {
			const repos = await githubService.getAllRepositories()
			let filteredRepos = repos.filter(
				(repo: any) => includePrivate || !repo.private,
			)

			if (language) {
				filteredRepos = filteredRepos.filter(
					(repo: any) =>
						repo.language?.toLowerCase() === language.toLowerCase(),
				)
			}

			// Sort repositories
			filteredRepos.sort((a: any, b: any) => {
				switch (sortBy) {
					case "updated":
						return (
							new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
						)
					case "created":
						return (
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
						)
					case "name":
						return a.name.localeCompare(b.name)
					case "stars":
					default:
						return 0
				}
			})

			return {
				repositories: filteredRepos.slice(0, limit),
				total: filteredRepos.length,
				accounts: githubService.getAccounts().map((acc: any) => ({
					id: acc.id,
					username: acc.username,
				})),
			}
		} catch (error: any) {
			throw new Error(`Failed to list repositories: ${error.message}`)
		}
	},
})
