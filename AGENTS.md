# CMS backend operating guide

## Scope and architecture

- This repository is a NestJS 11 / Express 5 TypeScript API. `src/main.ts` sets the `/api/v1` global prefix (except `/health`), global validation (`transform`, `whitelist`), CORS, request IDs, a 50 MB request-body limit, and development-only API docs.
- Feature modules live in `src/<feature>/` with controller, service, DTO, and module files. Controllers return `{ data, meta }`; services own Prisma access and DTO transformation. Shared cross-cutting code is under `src/shared/`.
- PostgreSQL is accessed only through Prisma (`prisma/schema.prisma`, `PrismaService`). Treat Prisma schema and migration history as the database source of truth; inspect both before changing query or model behavior.
- Public content features include events, resources, blogs, opportunities, and organizations. List and detail output contracts are DTO-based and must remain compatible unless a change is explicitly approved.

## Conventions and safety

- DTO validation uses `class-validator`; the global validation pipe strips undeclared input fields. Use `plainToInstance` / `ClassSerializerInterceptor` consistently with existing response DTOs.
- JWT guards protect mutations; role restrictions use `@Roles` plus `RolesGuard`. Do not weaken public/private visibility rules incidentally.
- Shared logging records request completion time; the global exception filter formats errors. Preserve request context and structured API errors.
- Content records commonly use `deletedAt`, draft and/or moderation/publication fields. Explicitly retain the feature's existing visibility semantics when changing reads.
- There is no repository-configured application or HTTP response cache. Do not add caching without evidence, invalidation rules, and contract validation.
- Avoid broad relation `include`s and rich body fields on list endpoints unless required. Use pagination with a bounded page size, but preserve current API behavior until authorized.

## Commands and environment

- Node version declared in `.tool-versions` is 22.21. Lockfiles exist for npm and pnpm; production Docker uses pnpm. Do not install, upgrade, or regenerate dependencies without approval.
- Existing scripts: `npm run dev`, `npm run build`, `npm run prod`, `npm test`, `npm run test:cov`, `npm run migrate:dev`, `npm run migrate:deploy`, and `npm run migrate:seed`. There are no configured lint, format, or standalone typecheck scripts.
- `DATABASE_URL` is required by Prisma and configuration validation. `.env.template` currently says `DB_URL`; do not assume that name works. Other configuration requires app port, JWT material, ImageKit, Azure email, and base URLs.
- Migrations and seeds mutate data/schema. Never run them against an unknown, shared, staging, or production database without explicit approval. Docker Compose also runs `migrate deploy`; do not use it as a generic smoke test.

## Git boundary

- Base is `upstream/main`; working branch is `perf/cms-api-optimization`; `origin` is the user fork. Inspect status/diff before and after work and preserve unrelated user changes.
- Never commit, push, merge, rebase, reset, rewrite history, change branches, or create a PR without explicit permission. Never use `git add .` or `git add -A`; only stage explicit, validated files if permitted.
