import { Mastra } from "@mastra/core/mastra"
import { PinoLogger } from "@mastra/loggers"
import { LibSQLStore } from "@mastra/libsql"
import { weatherWorkflow } from "./workflows/weather-workflow"
import { weatherAgent } from "./agents/weather-agent"
import { resumeHelperAgent, githubExpertAgent } from "./agents"
import { generateResumeWorkflow, analyzeCodebaseWorkflow } from "./workflows"

export const mastra = new Mastra({
	workflows: { generateResumeWorkflow, analyzeCodebaseWorkflow },
	agents: { resumeHelperAgent, githubExpertAgent },
	storage: new LibSQLStore({
		// stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
		url: ":memory:",
	}),
	logger: new PinoLogger({
		name: "Mastra",
		level: "info",
	}),
})
