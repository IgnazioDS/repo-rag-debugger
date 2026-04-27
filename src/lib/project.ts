/**
 * Project metadata sourced from `src/repo_rag_debugger/project.json`.
 * Hardcoded as a TS module so it ships in the static bundle without runtime
 * file-system access.
 */

export interface ProjectSpec {
  slug: string;
  name: string;
  category: string;
  track: string;
  stage: string;
  summary: string;
  problem: string;
  users: string;
  stack: string[];
  why_now: string;
  mvp: string[];
  github_url: string;
  /** Slug returned by the system's `/api/stats` endpoint. */
  system_slug: string;
}

export const PROJECT: ProjectSpec = {
  slug: "repo-rag-debugger",
  name: "Repo RAG Debugger",
  category: "Developer Tool",
  track: "LLM",
  stage: "Ready to build",
  summary:
    "A source-aware debugging assistant that indexes codebases, stack traces, and docs to propose grounded fixes.",
  problem:
    "Developers waste time reconstructing code context from scattered docs, logs, and repository structure.",
  users: "AI engineers, backend teams, open-source maintainers",
  stack: ["Python", "FastAPI", "SQLite", "Embeddings", "RAG"],
  why_now:
    "Codebase copilots remain weak at repository-specific reasoning and postmortem-style debugging.",
  mvp: [
    "Index repositories and markdown docs",
    "Upload stack traces or pasted errors",
    "Return grounded explanations with cited files",
    "Track accepted fixes for future retrieval",
  ],
  github_url: "https://github.com/IgnazioDS/repo-rag-debugger",
  system_slug: "repo-rag-debugger",
};
