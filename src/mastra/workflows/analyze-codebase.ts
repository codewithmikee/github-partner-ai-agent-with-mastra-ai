// src/mastra/workflows/analyze-codebase.ts
import { createStep, createWorkflow } from "@mastra/core/workflows"
import { z } from "zod"
import { RuntimeContext } from "@mastra/core/di"
import { listRepositoriesTool, analyzeCodebaseTool } from "../tools"

// Define schemas
const codebaseInputSchema = z.object({
	owner: z.string().describe("Repository owner username"),
	repo: z.string().describe("Repository name"),
	includeRecommendations: z
		.boolean()
		.default(true)
		.describe("Whether to include improvement recommendations"),
})

const repositoryInfoSchema = z.object({
	repository: z.any().describe("Repository information"),
	found: z.boolean().describe("Whether repository was found"),
})

const analysisSchema = z.object({
	repository: z.any().describe("Repository details"),
	analysis: z.any().describe("Code analysis results"),
	structure: z.any().describe("Project structure information"),
	insights: z.any().describe("Development insights"),
})

const recommendationsSchema = z.object({
	recommendations: z.array(z.string()).describe("Improvement recommendations"),
	actionItems: z.array(z.string()).describe("Actionable next steps"),
	analysis: z.any().describe("Full analysis data"),
})

// Step 1: Fetch repository information
const fetchRepoStep = createStep({
	id: "fetch-repo-info",
	description: "Fetch repository information from GitHub accounts",
	inputSchema: codebaseInputSchema,
	outputSchema: repositoryInfoSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: fetch-repo-info")
		const { owner, repo } = inputData

		try {
			const result = await listRepositoriesTool.execute!({
				context: { limit: 100, sortBy: "updated", includePrivate: false },
				mastra,
				runtimeContext: runtimeContext || new RuntimeContext(),
			})

			const repository = (result as any).repositories.find(
				(r: any) => r.name === repo && r.username === owner,
			)

			console.log(
				`Step fetch-repo-info: ${
					repository ? "Found" : "Not found"
				} repository ${owner}/${repo}`,
			)

			return {
				repository: repository || null,
				found: !!repository,
			}
		} catch (error: any) {
			console.error("Step fetch-repo-info: Failed -", error.message)
			return { repository: null, found: false }
		}
	},
})

// Step 2: Analyze repository structure
const analyzeStructureStep = createStep({
	id: "analyze-structure",
	description: "Analyze repository structure and codebase",
	inputSchema: repositoryInfoSchema.extend({
		owner: z.string(),
		repo: z.string(),
	}),
	outputSchema: analysisSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: analyze-structure")
		const { owner, repo, found } = inputData

		if (!found) {
			throw new Error(`Repository ${owner}/${repo} not found`)
		}

		try {
			const result = await analyzeCodebaseTool.execute!({
				context: { owner, repo, maxDepth: 3 },
				mastra,
				runtimeContext: runtimeContext || new RuntimeContext(),
			})

			console.log(
				`Step analyze-structure: Succeeded - Analyzed ${owner}/${repo}`,
			)

			return {
				repository: (result as any).repository,
				analysis: (result as any).analysis,
				structure: (result as any).structure,
				insights: (result as any).insights,
			}
		} catch (error: any) {
			console.error("Step analyze-structure: Failed -", error.message)
			throw error
		}
	},
})

// Step 3: Generate recommendations
const generateRecommendationsStep = createStep({
	id: "generate-recommendations",
	description: "Generate improvement recommendations based on analysis",
	inputSchema: analysisSchema.extend({
		includeRecommendations: z.boolean(),
	}),
	outputSchema: recommendationsSchema,
	execute: async ({ inputData, mastra, runtimeContext }) => {
		console.log("Executing Step: generate-recommendations")
		const { analysis, insights, includeRecommendations } = inputData

		if (!includeRecommendations) {
			console.log(
				"Step generate-recommendations: Skipped - Recommendations not requested",
			)
			return {
				recommendations: [],
				actionItems: [],
				analysis: inputData,
			}
		}

		const recommendations: string[] = []
		const actionItems: string[] = []

		try {
			// Generate recommendations based on analysis
			if (!insights?.hasTests) {
				recommendations.push(
					"Add unit tests to improve code reliability and maintainability",
				)
				actionItems.push(
					"Set up testing framework (Jest, Vitest, or appropriate for your stack)",
				)
			}

			if (!insights?.modernStack && analysis?.technologies) {
				const hasTypeScript = analysis.technologies.includes("TypeScript")
				if (!hasTypeScript) {
					recommendations.push(
						"Consider migrating to TypeScript for better type safety and developer experience",
					)
					actionItems.push(
						"Add TypeScript configuration and migrate critical files first",
					)
				}
			}

			if (analysis?.complexity === "high" && !insights?.hasDocumentation) {
				recommendations.push(
					"Add comprehensive documentation for this complex codebase",
				)
				actionItems.push(
					"Create detailed README with setup instructions, architecture overview, and contribution guidelines",
				)
			}

			if (
				analysis?.frameworks?.length === 0 &&
				analysis?.technologies?.includes("JavaScript")
			) {
				recommendations.push(
					"Consider adopting a modern framework to improve development efficiency",
				)
				actionItems.push(
					"Evaluate frameworks like React, Vue, or Svelte based on project requirements",
				)
			}

			if (insights?.isWellStructured === false) {
				recommendations.push(
					"Improve project organization with clearer directory structure",
				)
				actionItems.push(
					"Reorganize files into logical folders (components, utils, services, etc.)",
				)
			}

			console.log(
				`Step generate-recommendations: Succeeded - Generated ${recommendations.length} recommendations`,
			)

			return {
				recommendations,
				actionItems,
				analysis: inputData,
			}
		} catch (error: any) {
			console.error("Step generate-recommendations: Failed -", error.message)
			return {
				recommendations: [],
				actionItems: [],
				analysis: inputData,
			}
		}
	},
})

// Define the workflow
export const analyzeCodebaseWorkflow = createWorkflow({
	id: "analyze-codebase-workflow",
	description:
		"Analyzes GitHub repository structure and provides improvement recommendations",
	inputSchema: codebaseInputSchema,
	outputSchema: recommendationsSchema,
})
	.then(fetchRepoStep)
	.then(analyzeStructureStep as any)
	.then(generateRecommendationsStep as any)
	.commit()
