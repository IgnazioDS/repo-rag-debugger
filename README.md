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

## Production telemetry

This deployment exposes public, aggregate metrics at `/api/stats`. The endpoint
is consumed by the Production Telemetry panel on https://eleventh.dev. The
schema is documented at
https://github.com/IgnazioDS/IgnazioDS/blob/main/TELEMETRY_SCHEMA.md.

This system is in **showcase mode** — the Vercel deploy is a public landing
page, not a system processing production workload. The endpoint exposes real
GitHub-derived metrics about the codebase rather than fabricated activity
counters. Tier-A workload metrics (`debug_sessions_24h`, `queries_24h`,
`fixes_proposed_24h`, etc.) are added when the system is promoted from
showcase to production.

Sample response:

```bash
$ curl -i https://repo-rag-debugger.vercel.app/api/stats
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: public, max-age=30, stale-while-revalidate=60
Access-Control-Allow-Origin: *

{
  "system": "repo-rag-debugger",
  "mode": "showcase",
  "status": "operational",
  "last_deployed_at": "2026-04-27T18:41:57Z",
  "last_commit_at": "2026-04-01T17:00:07Z",
  "metrics": {
    "commits_30d": 1,
    "commits_total": 4,
    "primary_language": "Python",
    "repo_stars": 0,
    "lines_of_code": 1361
  },
  "schema_version": 1,
  "generated_at": "2026-04-27T18:42:51Z"
}
```

The endpoint never returns HTTP 5xx. If GitHub is unreachable, the response
status flips to `"degraded"` and metric values fall back to last known good
(or zero) values, while the JSON contract remains valid.

To regenerate `lines_of_code` before deploying:

```bash
python3 scripts/compute_telemetry_static.py
git add api/_telemetry_static.json
```
