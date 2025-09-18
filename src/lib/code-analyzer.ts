// src/lib/code-analyzer.ts
import type { ProjectStructure, CodebaseAnalysis, Repository } from "./types"

export class CodeAnalyzer {
	analyzeCodebase(
		repository: Repository,
		structure: ProjectStructure,
	): CodebaseAnalysis {
		const frameworks = this.detectFrameworks(structure)
		const technologies = this.detectTechnologies(structure)
		const patterns = this.detectPatterns(structure)
		const complexity = this.assessComplexity(structure)
		const mainPurpose = this.inferMainPurpose(repository, structure)
		const keyFeatures = this.extractKeyFeatures(structure)

		return {
			repository,
			structure,
			frameworks,
			technologies,
			patterns,
			complexity,
			mainPurpose,
			keyFeatures,
		}
	}

	private detectFrameworks(structure: ProjectStructure): string[] {
		const frameworks: Set<string> = new Set()

		// Analyze package.json files
		structure.packageJsons.forEach(pkg => {
			const deps = { ...pkg.dependencies, ...pkg.devDependencies }

			Object.keys(deps).forEach(dep => {
				// React ecosystem
				if (dep === "react") frameworks.add("React")
				if (dep === "next") frameworks.add("Next.js")
				if (dep === "gatsby") frameworks.add("Gatsby")

				// Vue ecosystem
				if (dep === "vue") frameworks.add("Vue.js")
				if (dep === "nuxt") frameworks.add("Nuxt.js")

				// Angular
				if (dep.startsWith("@angular/")) frameworks.add("Angular")

				// Backend frameworks
				if (dep === "express") frameworks.add("Express.js")
				if (dep === "fastify") frameworks.add("Fastify")
				if (dep === "koa") frameworks.add("Koa")
				if (dep === "nestjs") frameworks.add("NestJS")

				// Fullstack
				if (dep === "svelte") frameworks.add("Svelte")
				if (dep === "remix") frameworks.add("Remix")
			})
		})

		// Analyze file structure
		const hasComponents = structure.directories.some(
			dir => dir.includes("components") || dir.includes("component"),
		)
		const hasPages = structure.directories.some(
			dir => dir.includes("pages") || dir.includes("page"),
		)

		if (hasComponents && hasPages && !frameworks.size) {
			frameworks.add("Custom Framework")
		}

		return Array.from(frameworks)
	}

	private detectTechnologies(structure: ProjectStructure): string[] {
		const technologies: Set<string> = new Set()

		// From file extensions
		Object.keys(structure.languages).forEach(ext => {
			switch (ext) {
				case "ts":
					technologies.add("TypeScript")
					break
				case "js":
					technologies.add("JavaScript")
					break
				case "jsx":
					technologies.add("JSX")
					break
				case "tsx":
					technologies.add("TSX")
					break
				case "py":
					technologies.add("Python")
					break
				case "rs":
					technologies.add("Rust")
					break
				case "go":
					technologies.add("Go")
					break
				case "java":
					technologies.add("Java")
					break
				case "cpp":
				case "cc":
				case "cxx":
					technologies.add("C++")
					break
				case "c":
					technologies.add("C")
					break
				case "rb":
					technologies.add("Ruby")
					break
				case "php":
					technologies.add("PHP")
					break
				case "swift":
					technologies.add("Swift")
					break
				case "kt":
					technologies.add("Kotlin")
					break
				case "dart":
					technologies.add("Dart")
					break
				case "css":
					technologies.add("CSS")
					break
				case "scss":
					technologies.add("SCSS")
					break
				case "sass":
					technologies.add("Sass")
					break
				case "less":
					technologies.add("Less")
					break
			}
		})

		// From package.json
		structure.packageJsons.forEach(pkg => {
			const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

			Object.keys(allDeps).forEach(dep => {
				if (dep.includes("tailwind")) technologies.add("Tailwind CSS")
				if (dep.includes("styled-components"))
					technologies.add("Styled Components")
				if (dep.includes("emotion")) technologies.add("Emotion")
				if (dep.includes("prisma")) technologies.add("Prisma")
				if (dep.includes("mongoose")) technologies.add("MongoDB")
				if (dep.includes("postgres") || dep.includes("pg"))
					technologies.add("PostgreSQL")
				if (dep.includes("mysql")) technologies.add("MySQL")
				if (dep.includes("redis")) technologies.add("Redis")
				if (dep.includes("graphql")) technologies.add("GraphQL")
				if (dep.includes("apollo")) technologies.add("Apollo")
				if (dep.includes("stripe")) technologies.add("Stripe")
				if (dep.includes("auth0")) technologies.add("Auth0")
				if (dep.includes("firebase")) technologies.add("Firebase")
				if (dep.includes("aws-sdk")) technologies.add("AWS")
			})
		})

		return Array.from(technologies)
	}

	private detectPatterns(structure: ProjectStructure): string[] {
		const patterns: Set<string> = new Set()

		const dirs = structure.directories.map(d => d.toLowerCase())
		const files = structure.files.map(f => f.name.toLowerCase())

		// Architecture patterns
		if (dirs.some(d => d.includes("components")))
			patterns.add("Component Architecture")
		if (dirs.some(d => d.includes("hooks"))) patterns.add("Custom Hooks")
		if (dirs.some(d => d.includes("context"))) patterns.add("Context API")
		if (dirs.some(d => d.includes("store") || d.includes("redux")))
			patterns.add("State Management")
		if (dirs.some(d => d.includes("middleware")))
			patterns.add("Middleware Pattern")
		if (dirs.some(d => d.includes("controllers"))) patterns.add("MVC Pattern")
		if (dirs.some(d => d.includes("services"))) patterns.add("Service Layer")
		if (dirs.some(d => d.includes("utils") || d.includes("helpers")))
			patterns.add("Utility Functions")
		if (dirs.some(d => d.includes("types"))) patterns.add("Type Definitions")

		// Testing patterns
		if (files.some(f => f.includes("test") || f.includes("spec")))
			patterns.add("Unit Testing")
		if (files.some(f => f.includes("e2e"))) patterns.add("E2E Testing")

		// Config patterns
		if (files.some(f => f.includes("docker"))) patterns.add("Containerization")
		if (files.some(f => f.includes("ci") || f.includes(".yml")))
			patterns.add("CI/CD")

		return Array.from(patterns)
	}

	private assessComplexity(
		structure: ProjectStructure,
	): "low" | "medium" | "high" {
		const fileCount = structure.files.length
		const dirCount = structure.directories.length
		const langCount = Object.keys(structure.languages).length
		const packageCount = structure.packageJsons.length

		// Simple scoring system
		let score = 0
		if (fileCount > 50) score += 2
		else if (fileCount > 20) score += 1

		if (dirCount > 20) score += 2
		else if (dirCount > 10) score += 1

		if (langCount > 3) score += 1
		if (packageCount > 1) score += 1

		if (score >= 4) return "high"
		if (score >= 2) return "medium"
		return "low"
	}

	private inferMainPurpose(
		repository: Repository,
		structure: ProjectStructure,
	): string {
		const name = repository.name.toLowerCase()
		const desc = (repository.description || "").toLowerCase()
		const dirs = structure.directories.map(d => d.toLowerCase())
		const hasPackageJson = structure.packageJsons.length > 0

		// Web application patterns
		if (dirs.some(d => d.includes("components") || d.includes("pages"))) {
			return "Web Application"
		}

		// API patterns
		if (
			dirs.some(
				d =>
					d.includes("routes") ||
					d.includes("controllers") ||
					d.includes("api"),
			)
		) {
			return "API Server"
		}

		// Library patterns
		if (hasPackageJson && (name.includes("lib") || desc.includes("library"))) {
			return "Library/Package"
		}

		// CLI patterns
		if (dirs.some(d => d.includes("cli") || d.includes("bin"))) {
			return "CLI Tool"
		}

		// Mobile patterns
		if (dirs.some(d => d.includes("android") || d.includes("ios"))) {
			return "Mobile Application"
		}

		// Default based on languages
		const languages = Object.keys(structure.languages)
		if (languages.includes("html") || languages.includes("css")) {
			return "Website"
		}

		return "Software Project"
	}

	private extractKeyFeatures(structure: ProjectStructure): string[] {
		const features: Set<string> = new Set()

		// From package.json
		structure.packageJsons.forEach(pkg => {
			const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

			Object.keys(allDeps).forEach(dep => {
				if (dep.includes("auth")) features.add("Authentication")
				if (dep.includes("payment") || dep.includes("stripe"))
					features.add("Payment Processing")
				if (dep.includes("upload")) features.add("File Upload")
				if (dep.includes("email")) features.add("Email Integration")
				if (dep.includes("chart") || dep.includes("graph"))
					features.add("Data Visualization")
				if (dep.includes("map")) features.add("Maps Integration")
				if (dep.includes("socket")) features.add("Real-time Communication")
				if (dep.includes("test")) features.add("Testing Suite")
				if (dep.includes("deploy")) features.add("Deployment Tools")
			})
		})

		// From directory structure
		const dirs = structure.directories.map(d => d.toLowerCase())
		if (dirs.some(d => d.includes("admin"))) features.add("Admin Panel")
		if (dirs.some(d => d.includes("dashboard"))) features.add("Dashboard")
		if (dirs.some(d => d.includes("blog"))) features.add("Blog System")
		if (dirs.some(d => d.includes("shop") || d.includes("cart")))
			features.add("E-commerce")
		if (dirs.some(d => d.includes("chat"))) features.add("Chat System")

		return Array.from(features)
	}
}
