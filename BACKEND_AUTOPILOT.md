# Backend autopilot operating contract

## Start and coordinate

1. Read `AGENTS.md`, then `BACKEND_OPTIMIZATION.md`, before investigating or changing code.
2. Act as the lead coordinator. Split independent work across subagents with disjoint file ownership; the lead integrates and validates centrally.
3. Prefer evidence-backed code-change mode once the cause and contract are understood. Batch compatible fixes; avoid endless micro-optimization.

## Engineering priorities

- Optimize public API latency and response efficiency while preserving correctness and documented API contracts. Do not attribute frontend SSR latency to this API without traces across frontend, network, application, and database layers.
- Validate both list and detail behavior: anonymous/authenticated access, publication visibility, filters, sort, pagination metadata, relation payloads, response schema, and mutation/cache invalidation.
- Measure before and after: endpoint latency, DB timing/plan, query count, response bytes, and cache behavior. Never invent a benchmark or infer an index/plan without evidence.
- Stop when remaining work is blocked, speculative, or low-value; record the next measurement or authority needed.

## Command policy

Autonomously use low-risk local commands for source reading/searching, build, tests, type checks where configured, non-destructive local/API smoke tests, git status/diff/diff-check, and read-only configured database/schema inspection. Keep approval for dependency installation/upgrades, secrets/credentials, destructive database operations, schema/data-changing migrations, production/staging mutation, destructive filesystem actions, and all Git history/remote changes.

## Git boundary

Codex may inspect, edit, test, validate, and review diffs. It may stage only explicit, validated intended files at the end if permitted. It must never use `git add .` or `git add -A`, stage unrelated existing work, commit, push, merge, rebase, reset, cherry-pick, rewrite history, change branches, or create/merge a PR without explicit user permission. If a file mixes user work with Codex edits, do not stage it automatically.
