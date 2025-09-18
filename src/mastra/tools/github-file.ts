// src/mastra/tools/github-file.ts
import { createTool } from "@mastra/core"
import { z } from "zod"
import { GitHubService } from "../../lib/github-service"

const githubService = new GitHubService()

export const createFileTool = createTool({
	id: "create_file",
	description: "Create or update a file in a repository",
	inputSchema: z.object({
		owner: z.string().describe("Repository owner username"),
		repo: z.string().describe("Repository name"),
		path: z.string().describe("File path in the repository"),
		content: z.string().describe("File content"),
		message: z.string().describe("Commit message"),
		sha: z.string().optional().describe("SHA of existing file (for updates)"),
	}),
	execute: async ({ context }) => {
		const { owner, repo, path, content, message, sha } = context

		try {
			// For demo purposes - you'll need to implement the actual GitHub API call
			// This would use githubService.createOrUpdateFile(owner, repo, path, content, message, sha)

			return {
				success: true,
				file: {
					path,
					message,
					url: `https://github.com/${owner}/${repo}/blob/main/${path}`,
				},
			}
		} catch (error: any) {
			throw new Error(`Failed to create/update file: ${error.message}`)
		}
	},
})
