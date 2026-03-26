# Repo RAG Debugger

A source-aware debugging assistant that indexes codebases, stack traces, and docs to propose grounded fixes.

## Problem

Developers waste time reconstructing code context from scattered docs, logs, and repository structure.

## Users

AI engineers, backend teams, open-source maintainers

## Core Capabilities

- Index repositories and markdown docs
- Upload stack traces or pasted errors
- Return grounded explanations with cited files
- Track accepted fixes for future retrieval

## Why This Matters

Codebase copilots remain weak at repository-specific reasoning and postmortem-style debugging.

## Architecture

- `core`: domain logic for repo rag debugger.
- `cli`: operator-facing entrypoint for local workflows and smoke checks.
- `docs/`: product notes, roadmap, and architecture decisions.
- `tests/`: baseline regression coverage for the project contract.

## Local Usage

```bash
uv run repo-rag-debugger summary
uv run repo-rag-debugger capabilities
uv run repo-rag-debugger roadmap
```

## Initial Stack Direction

Python, FastAPI, SQLite, Embeddings, RAG

## Delivery Standard

- Clear product thesis
- Setup that works locally
- Tests for the primary contract
- Documentation for roadmap and architecture
- Space for production integrations in the next iteration

## Showcase

This repository ships with a static Vercel-ready landing page for demos and previews.

```bash
vercel deploy -y
```

The deployed site presents Repo RAG Debugger as a standalone product page.
