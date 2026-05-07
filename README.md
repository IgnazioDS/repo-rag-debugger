# Repo RAG Debugger

> A source-aware debugging assistant. Indexes codebases, stack traces, and docs to propose grounded fixes — RAG built for the engineering loop, not the demo.

[**Live dashboard →**](https://repo-rag-debugger.eleventh.dev) · Stage: Ready to build · Track: LLM · Category: Developer Tool

---

## Status: showcase-state

**This repository is in showcase-state.** The debugger itself — the codebase indexer, the symbol-level retrieval engine, the grounded-fix proposer — is not yet in this repo. What ships now is a public dashboard, a stdlib-only telemetry endpoint, and a Python CLI scaffold that exposes the project contract. See [What ships right now](#what-ships-right-now) for the audit.

For an example of what one of these projects looks like once graduated to production, see [NexusRAG](https://github.com/IgnazioDS/NexusRAG) — same operator, same engineering bar, fully shipped.

---

## What this project is

LLM-assisted debugging that does not have access to the full codebase produces a predictable output: plausible-looking fixes that don't compile, or compile but reference imports that don't exist. The bottleneck is not the model — it is the retrieval substrate the model needs to ground every suggestion in the actual repo state.

Repo RAG Debugger is the substrate. It indexes the codebase, the test files, the relevant docs, and the historical commits that touched the same call site, then enforces a contract: every symbol referenced in a fix must trace back to the retrieval. No phantom imports. No deleted-function references. No surface fixes that miss the cross-file root cause.

## Architectural thesis

- **Source-aware retrieval is a different shape than RAG-over-documents.** The retrieval span has to cover: the file the error occurred in, its imports, the test files that exercise it, relevant documentation, and historical commits that touched the same call site. A document chunk-and-embed pipeline misses the import graph.
- **Grounding is at the symbol level, not the sentence level.** The debugger refuses to propose a fix that references a symbol the retrieval did not return. Hallucinated imports, renamed-then-deleted functions, ghost class members — all are caught at the same gate.
- **Stack traces are not context. The cross-file imports are the context.** An error in file A whose root cause lives in file C imported via B requires retrieval that walks the import graph, not just the trace's top frame.
- **The debugger is a post-error workflow tool, not an inline-completion tool.** It activates when the test fails, the build breaks, or the production stack trace lands in the postmortem channel.

## Failure modes this addresses

| Failure mode | What the debugger catches |
|---|---|
| Phantom imports | Model invents an import path that does not exist. Symbol-level grounding rejects the suggestion. |
| Deleted-function reference | Model proposes calling a function that was renamed or removed. Retrieval freshness check catches it before the fix lands. |
| Stack-trace context loss | Model receives a trace but no cross-file context, so the fix only addresses the surface error, not the root cause. |
| Phantom class members | Model invents `.foo()` on a class instance that does not have that method. Class-shape check rejects it. |
| Stale-API references | Model uses a library API that exists in its training data but was removed in the version the codebase pins. |

## Positioning

- **Category claimed**: source-aware debugging assistant for engineering teams that already have a codebase, not for greenfield prototypes.
- **Category refused**: ChatGPT-with-VS-Code-extension, Copilot-style inline-completion tools, "AI coach" assistants, "AI replaces senior engineers" registers.
- **Closest comparisons**:
  - **Cursor / Copilot Chat** — inline-completion + chat. The debugger is shaped for the post-error workflow specifically; it activates from a stack trace, not from a typing position.
  - **Sourcegraph Cody** — code-aware AI assistant the debugger is conceptually adjacent to, but adds debugging-loop discipline (symbol-level grounding, freshness check, root-cause walk over import graph).

---

## Planned MVP

The system the dashboard will graduate to:

- Index repositories and markdown docs (file-level + symbol-level)
- Upload stack traces or pasted errors
- Walk the import graph to surface cross-file context
- Return grounded explanations with cited files and citation hashes
- Track accepted fixes for future retrieval — the debugger learns from postmortems

**Planned product stack**: Python · FastAPI · SQLite (symbol index) · Embeddings · RAG.

---

## What ships right now

This is what is in the repo today, audited honestly.

### 1. Showcase dashboard (`/`)

Next.js 14 App Router app at the live URL above. Five routes:

| path | what it shows |
|---|---|
| `/` | Overview — pitch banner, live `/api/stats` Tier-B counters, system status, audience + stack |
| `/telemetry` | Polling telemetry consumer — full metric grid, raw JSON, 30s visibility-aware polling, contract docs |
| `/capabilities` | MVP scope, problem statement, why-now, audience, stack — read from `project.json` |
| `/roadmap` | Three-phase timeline (showcase → MVP build → Tier-A graduation) |
| `/settings` | Theme + project metadata |

### 2. Telemetry endpoint (`api/stats.py`)

Stdlib-only Vercel Python serverless function. Reports honest GitHub-derived signals — commits, stars, last commit, primary language, lines of code. Never simulated workload metrics. Contract documented in [TELEMETRY_SCHEMA.md](https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md).

### 3. Python CLI scaffold (`src/repo_rag_debugger/`)

Argparse-based CLI exposing the project contract. Currently three subcommands:

```
repo-rag-debugger summary       # name, summary, problem, users, stage, track
repo-rag-debugger capabilities  # planned MVP capabilities
repo-rag-debugger roadmap       # docs/roadmap.md
```

The CLI reads `project.json` — a typed registry that drives both the dashboard's `/capabilities` route and the CLI. When MVP work begins, the indexer and grounded-fix proposer layer onto this scaffold.

### 4. Deploy + telemetry pipeline

Vercel deploy with `/api/stats` cached 5 minutes, GitHub Actions for the type-check + vitest gate, build-time `_telemetry_static.json` artifact computed by `scripts/compute_telemetry_static.py`.

---

## Architecture (graduation path)

```
┌──── current repo state (showcase-tier) ────────────────────────────┐
│                                                                    │
│  Next.js dashboard ──▶  /api/stats (stdlib Python)  ──▶  GitHub   │
│  (5 routes)              cached 5 min                      API     │
│       │                                                            │
│       └─▶  reads ──▶  project.json  ◀── reads ── Python CLI       │
│                       (typed registry)                             │
└────────────────────────────────────────────────────────────────────┘

                              │  graduates to
                              ▼

┌──── planned MVP (Tier-A) ──────────────────────────────────────────┐
│                                                                    │
│  Stack trace ──▶  Indexer (symbol + file + import graph)          │
│       │                  │                                         │
│       │                  ▼                                         │
│       │           SQLite symbol index ──▶  Embeddings (chunks)    │
│       │                                                            │
│       │                  │                                         │
│       │                  ▼                                         │
│       └──▶  Retriever (walks import graph from error frame)       │
│                          │                                         │
│                          ▼                                         │
│                  Symbol-level grounding gate                      │
│                          │                                         │
│                          ▼                                         │
│                Grounded fix + citation hashes                      │
└────────────────────────────────────────────────────────────────────┘
```

The current dashboard is the public-facing shell. The Python CLI is the spine the MVP debugger will extend. `project.json` stays as the single source of truth for what the system claims to be.

---

## Quickstart

### Run the showcase dashboard

```bash
git clone https://github.com/IgnazioDS/repo-rag-debugger.git
cd repo-rag-debugger
npm install
npm run dev          # http://localhost:3000
```

### Run the Python CLI scaffold

```bash
cd repo-rag-debugger
python -m repo_rag_debugger.cli summary
python -m repo_rag_debugger.cli capabilities
python -m repo_rag_debugger.cli roadmap
```

### Test + type-check

```bash
npm run lint
npm run type-check
npm test                    # vitest suite
python -m pytest tests/     # python tests
```

---

## Dashboard stack

Next.js 14 App Router · TypeScript strict · Tailwind 3 · Geist Sans + Mono · Radix UI · cmdk (⌘K) · sonner · next-themes · framer-motion · vitest + Testing Library.

### Keyboard shortcuts

| keys | action |
|---|---|
| ⌘K / Ctrl+K | Command palette |
| G then O / T / C / R | Overview / Telemetry / Capabilities / Roadmap |

---

## More context

- **Operator's hub**: [eleventh.dev](https://eleventh.dev) — the public site this dashboard's telemetry feeds into
- **Reference shipped project**: [NexusRAG](https://github.com/IgnazioDS/NexusRAG) — production-grade multi-tenant RAG agent platform, same operator (and architecturally adjacent — both are RAG systems with explicit grounding contracts)
- **Telemetry contract**: [TELEMETRY_SCHEMA.md](https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md) — what the Tier-B counters mean and what they don't
- **Status of this project**: showcase-tier. The debugger graduates when the symbol-level grounding gate is live against a real codebase.

---

## License

MIT — see [LICENSE](./LICENSE).
