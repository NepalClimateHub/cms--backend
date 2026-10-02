# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (Node 22.21.1 via `.tool-versions`).

```bash
pnpm dev                 # nest start --watch
pnpm build               # nest build + copies src/templates -> dist/src/ (handlebars email templates)
pnpm prod                # node dist/src/main
pnpm test                # jest --runInBand (unit, *.spec.ts under src/)
pnpm test -- events      # single file / pattern
pnpm test:cov
pnpm test:e2e            # ./test/jest-e2e.json
pnpm migrate:dev         # prisma migrate dev
pnpm migrate:deploy      # prisma migrate deploy (used by docker-compose on boot)
pnpm migrate:seed        # tsx scripts/seed/index.ts
pnpm doc:serve           # compodoc on :8001
```

No linter is configured. `.husky/pre-push` runs `pnpm build`, so a type error blocks pushes.

Docker: `docker compose up` builds `Dockerfile.prod`, runs `prisma migrate deploy` then the app, plus postgres 16 and watchtower. Because it applies migrations on boot, do not use it as a smoke test against a shared database.

CI: `.github/workflows/docker-deploy.yml` builds and pushes the Docker image on every push to `main`. There is no CI test or build job, so run `pnpm test` and `pnpm build` locally.

## Architecture

NestJS 11 + Prisma 6 (PostgreSQL) REST API for the NCH CMS. Global prefix `api/v1` (`/health` excluded). Swagger/Scalar docs mounted at `/docs` and `/swagger.json` **only when `APP_ENV=development`**.

### Module layout

Each domain lives in `src/<domain>/` and follows `controllers/`, `services/`, `dto/`, `<domain>.module.ts`. Smaller modules (activity-log, notification, database) flatten this to files at the module root. All modules are registered in `src/app.module.ts`.

Domains: events, news, blog, opportunity, project, resource, organization, member, minutes, testimonial, vacancy, climate-champion, category, tags, user, auth, analytics, email-subscription, notification, activity-log, imagekit, ai-assistant, database.

### Cross-cutting layer (`src/shared/`)

- **`RequestContext`** — every controller method takes `@ReqContext() ctx: RequestContext` (requestID, url, ip, user claims) as its first param and passes it into the service. Services log with `this.logger.log(ctx, ...)`.
- **`AppLogger`** (winston) — injected everywhere; each class calls `this.logger.setContext(ClassName.name)` in its constructor.
- **`PrismaService`** — the only DB access path, exported from `SharedModule`. There is no repository layer; services call `this.prismaService.<model>` directly.
- **Validation** — the global `ValidationPipe` runs with `transform: true, whitelist: true`, so any body/query field without a `class-validator` decorator on the DTO is silently stripped.
- **Global providers** registered in `SharedModule`: `LoggingInterceptor` (APP_INTERCEPTOR) and `AllExceptionsFilter` (APP_FILTER, produces the `BaseApiErrorResponse` shape).
- **`applyFilters<T>`** (`shared/filters/prisma-filter.filter.ts`) — list endpoints build their Prisma `where` by declaring an `availableFilters` map keyed by query param; results merge under a top-level `AND`. Use `createSearchKey` for Postgres full-text search (`fullTextSearchPostgres` preview feature is enabled).
- **Responses** — services return DTOs via `plainToInstance`; controllers return `BaseApiResponse<T>` (`{ data, meta }`). For Swagger, wrap types with `SwaggerBaseApiResponse(Dto)` / `SwaggerBaseApiResponse([Dto])`. Because NestJS generics break OpenAPI, common wrappers are pre-declared in `shared/dtos/specific-api-responses.dto.ts` and looked up by name; `src/main.ts` additionally post-processes the generated document to rename malformed schema keys. If a new DTO produces ugly schema names, add it to that map rather than patching main.ts.

### Auth & authorization

JWT with RS-style keys supplied base64-encoded (`JWT_PUBLIC_KEY_BASE64` / `JWT_PRIVATE_KEY_BASE64`, decoded in `shared/configs/configuration.ts`). Passport strategies: local, jwt-auth, jwt-refresh. Guards: `JwtAuthGuard`, `OptionalJwtAuthGuard`, `JwtRefreshGuard`, `RolesGuard`.

A single `ROLE` enum (`src/auth/constants/role.constant.ts`) mirrors Prisma's `UserType` and the JWT `role` claim: SUPER_ADMIN, ADMIN, CONTENT_ADMIN, ORGANIZATION, INDIVIDUAL. Use `ALL_ROLES` for any-signed-in-user routes. Protect a route with `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)`; `SUPER_ADMIN` bypasses all role checks in `RolesGuard`.

`shared/acl/` (`BaseAclService`, Action/Actor constants) and `shared/constants/permissions/` are a second, largely unused permission mechanism — prefer the `@Roles` guard path unless extending an existing ACL consumer.

### Content moderation

Content models carry `ContentStatus` (DRAFT / UNDER_REVIEW / PUBLISHED / REJECTED / IMPROVEMENT_REQUIRED). Moderation endpoints accept `ContentModerationDto` with `ModerationAction` (APPROVE / REQUEST_IMPROVEMENTS / REJECT). Events additionally use `PublicationStatus` (DRAFT/PUBLISHED) and `EventStatus` (OPEN/UPCOMING/CLOSED) — these replaced the older `isDraft` boolean and string status.

### Public list summaries & caching

Events, blog, opportunity and resource list endpoints accept an opt-in `?view=summary` query param. It switches the Prisma query from the full `include` to a narrow `select` and returns a `*SummaryDto` instead of the full response DTO; omitting it keeps the legacy full shape (the public site depends on both). `src/content-summary-projections.service.spec.ts` pins the exact `select` shapes — update it when changing a summary projection.

Summary requests with no `Authorization` and no `Cookie` header are treated as anonymous: the controller sets a public `Cache-Control` (everything else gets `private, no-store`) and the service serves from a per-instance in-memory `Map` with a 5-minute TTL keyed on the normalised query. Every mutation in those services (create / update / delete / moderate) must call `clearPublicSummaryCache()` — add the call to any new write path, otherwise public lists go stale for up to 5 minutes. The cache is process-local, so it is not shared across replicas.

`BACKEND_OPTIMIZATION.md` is the running log of this performance work, including the public frontend ↔ CMS contract (section 15) — read it before changing list/detail response shapes. `AGENTS.md` predates the cache and the pnpm switch (it says there is no cache and lists `npm run` scripts); trust this file where they differ.

### Activity log

`ActivityLogService.logActivity(ctx, action, entity, id, name)` is fire-and-forget (do **not** await; errors are swallowed) and only records actions by SUPER_ADMIN/ADMIN/CONTENT_ADMIN.

### External services

- **ImageKit** — media uploads (`src/imagekit`).
- **Azure Communication Email** — `src/utils/email.util.ts` renders handlebars templates from `src/templates/*.hbs`. Adding a template means adding an `EmailType` entry; the build step copies templates into `dist`.
- **RAG service** — `src/ai-assistant` proxies to `RAG_SERVICE_URL` over `HttpService`, with a per-user `DAILY_PROMPT_LIMIT`.
- **`@nestjs/schedule` cron** — `src/database/database.service.ts` emails a DB backup every 10 days.

## Config

Env vars are validated by Joi in `src/shared/configs/module-options.ts` — the app refuses to boot if a required var is missing. Note `.env.template` lists `DB_URL`, but Prisma and the Joi schema both require **`DATABASE_URL`**.

Access config through `ConfigService` using the nested keys built in `configuration.ts` (e.g. `configService.get('jwt.privateKey')`), not `process.env`.

## Conventions

- Newer code uses double quotes and `plainToInstance`; older code uses single quotes and `plainToClass`. Match the file you are editing.
- Imports are relative (`../../shared/...`); no TS path aliases are configured.
- `strict: true` with `strictPropertyInitialization: false` — DTO class properties are declared without initializers.
- Branches: work on `develop`/`feat/*`, production is `main`.
