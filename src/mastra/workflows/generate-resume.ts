// src/mastra/workflows/generate-resume.ts
import { createStep, createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { RuntimeContext } from "@mastra/core/di"
import { listRepositoriesTool, analyzeCodebaseTool } from "../tools"

// Define schemas
const resumeInputSchema = z.object({
	targetRole: z.string().optional().describe("Target job role or industry"),
	experience: z
		.enum(["junior", "mid", "senior"])
		.default("mid")
		.describe("Experience level"),
	focusAreas: z
		.array(z.string())
		.optional()
		.describe("Areas of focus or specialization"),
	maxProjects: z
		.number()
		.min(3)
		.max(10)
		.default(5)
		.describe("Maximum number of projects to analyze"),
})

const repositoriesSchema = z.object({
	repositories: z.array(z.any()).describe("List of repositories"),
	totalCount: z.number().describe("Total repository count"),
})

const analyzedProjectsSchema = z.object({
	analyzedProjects: z.array(z.any()).describe("Analyzed project data"),
	skills: z.array(z.string()).describe("Extracted technical skills"),
})

const resumeSchema = z.object({
	projects: z.array(z.any()).describe("Resume-ready project descriptions"),
	skillsSummary: z
		.object({
			technical: z.array(z.string()).describe("Technical programming skills"),
			frameworks: z
				.array(z.string())
				.describe("Framework and library expertise"),
			tools: z.array(z.string()).describe("Tools and technologies used"),
		})
		.describe("Categorized skills summary"),
	summary: z.string().describe("Professional summary statement"),
	experience: z.string().describe("Experience level"),
	targetRole: z.string().optional().describe("Target role"),
})

// Step 1: Fetch repositories
const fetchRepositoriesStep = createStep({
	id: "fetch-repositories",
	description: "Fetch all repositories for resume analysis",
	inputSchema: resumeInputSchema,
	outputSchema: repositoriesSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: fetch-repositories")
		const { maxProjects } = inputData

		try {
			const result = await listRepositoriesTool.execute!({
				context: {
					limit: maxProjects * 2, // Get more to filter from
					sortBy: "stars",
					includePrivate: false, // Only public repos for resume
				},
				mastra,
				runtimeContext: runtimeContext || new RuntimeContext(),
			})

			console.log(
				`Step fetch-repositories: Succeeded - Found ${
					(result as any).repositories.length
				} repositories`,
			)

			return {
				repositories: (result as any).repositories,
				totalCount: (result as any).total,
			}
		} catch (error: any) {
			console.error("Step fetch-repositories: Failed -", error.message)
			throw error
		}
	},
})

// Step 2: Analyze top projects
const analyzeTopProjectsStep = createStep({
	id: "analyze-top-projects",
	description: "Analyze most significant projects for resume content",
	inputSchema: repositoriesSchema.extend({
		maxProjects: z.number(),
	}),
	outputSchema: analyzedProjectsSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: analyze-top-projects")
		const { repositories, maxProjects } = inputData

		// Filter and select top repositories
		const topRepos = repositories
			.filter((repo: any) => !repo.name.toLowerCase().includes("fork"))
			.filter((repo: any) => !repo.name.toLowerCase().includes("test"))
			.filter((repo: any) => repo.description) // Prefer repos with descriptions
			.slice(0, maxProjects)

		const analyzedProjects = []
		const skillsSet = new Set<string>()

		for (const repo of topRepos) {
			try {
				console.log(`Analyzing repository: ${repo.name}`)

				const analysis = await analyzeCodebaseTool.execute!({
					context: {
						owner: repo.username,
						repo: repo.name,
						maxDepth: 2, // Lighter analysis for resume generation
					},
					mastra,
					runtimeContext: runtimeContext || new RuntimeContext(),
				})

				const projectData = {
					...repo,
					analysis: (analysis as any).analysis,
					insights: (analysis as any).insights,
					significance:
						repo.stars > 10 ? "high" : repo.stars > 2 ? "medium" : "low",
				}

				analyzedProjects.push(projectData)

				// Collect skills
				if ((analysis as any).analysis?.technologies) {
					;(analysis as any).analysis.technologies.forEach((tech: string) =>
						skillsSet.add(tech),
					)
				}
				if ((analysis as any).analysis?.frameworks) {
					;(analysis as any).analysis.frameworks.forEach((framework: string) =>
						skillsSet.add(framework),
					)
				}
				if ((analysis as any).analysis?.patterns) {
					;(analysis as any).analysis.patterns.forEach((pattern: string) => {
						if (pattern.includes("Testing")) skillsSet.add("Testing")
						if (pattern.includes("API")) skillsSet.add("API Development")
						if (pattern.includes("Database")) skillsSet.add("Database Design")
					})
				}
			} catch (error: any) {
				console.error(`Failed to analyze ${repo.name}:`, error.message)
				// Continue with basic repo info
				analyzedProjects.push({
					...repo,
					analysis: null,
					insights: null,
					significance: "low",
				})
			}
		}

		console.log(
			`Step analyze-top-projects: Succeeded - Analyzed ${analyzedProjects.length} projects, found ${skillsSet.size} skills`,
		)

		return {
			analyzedProjects,
			skills: Array.from(skillsSet),
		}
	},
})

// Step 3: Generate resume sections
const generateResumeSectionsStep = createStep({
	id: "generate-resume-sections",
	description: "Generate professional resume sections from analyzed projects",
	inputSchema: analyzedProjectsSchema.extend({
		targetRole: z.string().optional(),
		experience: z.string(),
		focusAreas: z.array(z.string()).optional(),
	}),
	outputSchema: resumeSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: generate-resume-sections")
		const { analyzedProjects, skills, targetRole, experience, focusAreas } =
			inputData

		try {
			// Generate project descriptions optimized for resumes
			const projects = analyzedProjects.map((project: any) => {
				const highlights = []

				// Add framework/technology highlights
				if (project.analysis?.frameworks?.length > 0) {
					highlights.push(
						`Built with ${project.analysis.frameworks.slice(0, 2).join(", ")}`,
					)
				}

				// Add metrics
				if (project.stars > 0) {
					highlights.push(`${project.stars} GitHub stars`)
				}
				if (project.forks > 0) {
					highlights.push(`${project.forks} forks`)
				}

				// Add key features
				if (project.analysis?.keyFeatures?.length > 0) {
					highlights.push(
						`Key features: ${project.analysis.keyFeatures
							.slice(0, 2)
							.join(", ")}`,
					)
				}

				// Add complexity indicator
				if (project.analysis?.complexity === "high") {
					highlights.push("Complex architecture with multiple services")
				}

				// Generate professional description
				let description =
					project.description ||
					project.analysis?.mainPurpose ||
					"Software development project"

				// Enhance description based on analysis
				if (project.analysis?.patterns?.length > 0) {
					const patterns = project.analysis.patterns
						.filter(
							(p: string) => !p.includes("Utility") && !p.includes("Helper"),
						)
						.slice(0, 2)
					if (patterns.length > 0) {
						description += `. Implements ${patterns.join(" and ")}.`
					}
				}

				return {
					name: project.name,
					description,
					technologies:
						project.analysis?.technologies ||
						[project.language].filter(Boolean),
					highlights,
					url: project.url,
					significance: project.significance,
					stars: project.stars,
					complexity: project.analysis?.complexity || "medium",
				}
			})

			// Categorize skills for resume sections
			const technicalSkills = skills.filter((skill: string) =>
				[
					"JavaScript",
					"TypeScript",
					"Python",
					"Java",
					"Go",
					"Rust",
					"C++",
					"C#",
					"PHP",
					"Ruby",
					"Swift",
					"Kotlin",
				].includes(skill),
			)

			const frameworks = skills.filter(
				(skill: string) =>
					skill.includes("React") ||
					skill.includes("Vue") ||
					skill.includes("Angular") ||
					skill.includes("Express") ||
					skill.includes("Next") ||
					skill.includes("Django") ||
					skill.includes("Spring") ||
					skill.includes("Laravel") ||
					skill.includes("Rails"),
			)

			const tools = skills.filter(
				(skill: string) =>
					!technicalSkills.includes(skill) &&
					!frameworks.includes(skill) &&
					(skill.includes("AWS") ||
						skill.includes("Docker") ||
						skill.includes("Database") ||
						skill.includes("API") ||
						skill.includes("Testing") ||
						skill.includes("Git")),
			)

			// Generate professional summary
			const projectCount = projects.length
			const topTechs = technicalSkills.slice(0, 3)
			const topFrameworks = frameworks.slice(0, 2)

			let summary = `${
				experience === "senior"
					? "Senior"
					: experience === "mid"
					? "Mid-level"
					: "Junior"
			} developer with expertise in ${topTechs.join(", ")}`

			if (topFrameworks.length > 0) {
				summary += ` and ${topFrameworks.join(", ")}`
			}

			summary += `. Demonstrated experience through ${projectCount} open-source projects`

			if (targetRole) {
				summary += ` with focus on ${targetRole.toLowerCase()}`
			}

			const totalStars = projects.reduce(
				(sum: number, p: any) => sum + (p.stars || 0),
				0,
			)
			if (totalStars > 10) {
				summary += `. Achieved ${totalStars}+ GitHub stars across projects`
			}

			summary += "."

			console.log(
				`Step generate-resume-sections: Succeeded - Generated resume with ${projects.length} projects and ${skills.length} skills`,
			)

			return {
				projects: projects.sort((a: any, b: any) => {
					// Sort by significance and stars
					if (a.significance !== b.significance) {
						const order = { high: 3, medium: 2, low: 1 }
						return (
							(order as any)[b.significance] - (order as any)[a.significance]
						)
					}
					return b.stars - a.stars
				}),
				skillsSummary: {
					technical: technicalSkills,
					frameworks,
					tools,
				},
				summary,
				experience,
				targetRole,
			}
		} catch (error: any) {
			console.error("Step generate-resume-sections: Failed -", error.message)
			throw error
		}
	},
})

// Define the workflow
export const generateResumeWorkflow = createWorkflow({
	id: "generate-resume-workflow",
	description:
		"Generates professional resume content from GitHub repository analysis",
	inputSchema: resumeInputSchema,
	outputSchema: resumeSchema,
})
	.then(fetchRepositoriesStep)
	.then(analyzeTopProjectsStep as any)
	.then(generateResumeSectionsStep as any)
	.commit()
