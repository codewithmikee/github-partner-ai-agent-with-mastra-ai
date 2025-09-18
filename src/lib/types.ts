// src/lib/types.ts
export interface GitHubAccount {
	username: string
	token: string
	id: string
}

export interface Repository {
	id: number
	name: string
	fullName: string
	description: string | null
	language: string | null
	stars: number
	forks: number
	size: number
	updatedAt: string
	createdAt: string
	private: boolean
	url: string
	account: string
	username: string
	topics: string[]
	license: string | null
	defaultBranch: string
}

export interface FileContent {
	name: string
	path: string
	sha: string
	size: number
	url: string
	content?: string
	encoding?: string
	type: "file" | "dir"
}

export interface ProjectStructure {
	files: FileContent[]
	directories: string[]
	languages: Record<string, number>
	packageJsons: any[]
	readmes: FileContent[]
	configs: FileContent[]
}

export interface CodebaseAnalysis {
	repository: Repository
	structure: ProjectStructure
	frameworks: string[]
	technologies: string[]
	patterns: string[]
	complexity: "low" | "medium" | "high"
	mainPurpose: string
	keyFeatures: string[]
}

export interface ResumeProject {
	name: string
	description: string
	technologies: string[]
	highlights: string[]
	metrics: {
		stars?: number
		forks?: number
		commits?: number
		linesOfCode?: number
	}
	url: string
	significance: "high" | "medium" | "low"
}
