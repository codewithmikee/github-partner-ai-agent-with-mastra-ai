// src/lib/github-service.ts
import { Octokit } from "@octokit/rest"
import type {
	GitHubAccount,
	Repository,
	FileContent,
	ProjectStructure,
} from "./types"

export class GitHubService {
	private accounts: Map<string, { account: GitHubAccount; octokit: Octokit }> =
		new Map()

	constructor() {
		this.initializeAccounts()
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
		].filter(acc => acc.username && acc.token)

		accounts.forEach(account => {
			const octokit = new Octokit({ auth: account.token })
			this.accounts.set(account.id, { account, octokit })
		})
	}

	async getAllRepositories(): Promise<Repository[]> {
		const allRepos: Repository[] = []

		for (const [accountId, { account, octokit }] of this.accounts) {
			try {
				const { data: repos } = await octokit.repos.listForAuthenticatedUser({
					sort: "updated",
					per_page: 100,
					visibility: "all",
				})

				allRepos.push(
					...(repos.map(repo => ({
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
					})) as any),
				)
			} catch (error: any) {
				console.error(`Error fetching repos for ${accountId}:`, error)
			}
		}

		return allRepos
	}

	async getRepositoryStructure(
		owner: string,
		repo: string,
	): Promise<ProjectStructure> {
		const account = this.getAccountByUsername(owner)
		if (!account) throw new Error(`Account not found for username: ${owner}`)

		const structure: ProjectStructure = {
			files: [],
			directories: [],
			languages: {},
			packageJsons: [],
			readmes: [],
			configs: [],
		}

		await this.traverseRepository(account.octokit, owner, repo, "", structure)

		return structure
	}

	private async traverseRepository(
		octokit: Octokit,
		owner: string,
		repo: string,
		path: string,
		structure: ProjectStructure,
		maxDepth: number = 3,
		currentDepth: number = 0,
	): Promise<void> {
		if (currentDepth > maxDepth) return

		try {
			const { data: contents } = await octokit.repos.getContent({
				owner,
				repo,
				path,
			})
			const items = Array.isArray(contents) ? contents : [contents]

			for (const item of items) {
				if (item.type === "dir") {
					structure.directories.push(item.path)
					await this.traverseRepository(
						octokit,
						owner,
						repo,
						item.path,
						structure,
						maxDepth,
						currentDepth + 1,
					)
				} else if (item.type === "file") {
					const fileInfo: FileContent = {
						name: item.name,
						path: item.path,
						sha: item.sha,
						size: item.size,
						url: item.html_url ?? "",
						type: "file",
					}

					// Get file content for important files
					if (this.shouldFetchContent(item.name)) {
						try {
							const { data: fileData } = await octokit.repos.getContent({
								owner,
								repo,
								path: item.path,
							})

							if ("content" in fileData && fileData.content) {
								fileInfo.content = Buffer.from(
									fileData.content,
									"base64",
								).toString()
								fileInfo.encoding = fileData.encoding
							}
						} catch (error: any) {
							console.error(`Error fetching content for ${item.path}:`, error)
						}
					}

					structure.files.push(fileInfo)

					// Categorize special files
					const fileName = item.name.toLowerCase()
					if (fileName.includes("package.json") && fileInfo.content) {
						try {
							structure.packageJsons.push(JSON.parse(fileInfo.content))
						} catch (error: any) {
							console.error(
								`Error parsing package.json at ${item.path}:`,
								error,
							)
						}
					}

					if (fileName.includes("readme")) {
						structure.readmes.push(fileInfo)
					}

					if (this.isConfigFile(fileName)) {
						structure.configs.push(fileInfo)
					}

					// Track languages by file extension
					const extension = this.getFileExtension(item.name)
					if (extension) {
						structure.languages[extension] =
							(structure.languages[extension] || 0) + 1
					}
				}
			}
		} catch (error: any) {
			console.error(
				`Error traversing ${owner}/${repo}${path ? `/${path}` : ""}:`,
				error,
			)
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
		]

		const name = fileName.toLowerCase()
		return importantFiles.some(pattern => name.includes(pattern))
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
		]

		return configPatterns.some(pattern => fileName.includes(pattern))
	}

	private getFileExtension(fileName: string): string | null {
		const parts = fileName.split(".")
		if (parts.length > 1) {
			return parts[parts.length - 1].toLowerCase()
		}
		return null
	}

	private getAccountByUsername(
		username: string,
	): { account: GitHubAccount; octokit: Octokit } | null {
		for (const accountData of this.accounts.values()) {
			if (accountData.account.username === username) return accountData
		}
		return null
	}

	getAccounts(): GitHubAccount[] {
		return Array.from(this.accounts.values()).map(({ account }) => account)
	}
}
