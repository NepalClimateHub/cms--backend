# Backend performance investigation tracker

Status: first source-proven, compatibility-preserving implementation batch complete; runtime/database measurement remains pending.

## 1. Architecture summary

NestJS 11 / Express 5 application in TypeScript, served under `/api/v1` (except `/health`). Feature controllers call feature services; services call a shared Prisma client against PostgreSQL and transform records into DTOs. Global validation, request IDs, a Winston-backed timing interceptor, and a global exception filter are configured. ImageKit, Azure Communication Email, and an HTTP RAG service are external integrations. No CacheModule, Redis/queue integration, HTTP cache headers, ETag logic, or cache interceptor was found.

## 2. Public API map

All listed endpoints return `{ data, meta }`. Lists report `meta.count`.

| Endpoint | Handler → query path | Auth / query / response |
| --- | --- | --- |
| `GET /api/v1/events` | `EventsController.getEvents` → `EventsService.getEvents` → `events.findMany` + `count` | Public; `limit`, `offset`, title, tagIds, status, publicationStatus, moderationStatus; address/tags; `EventResponseDto` |
| `GET /api/v1/events/:id` | `getOneEvent` → `events.findUnique` | Public; address/tags/eventGallery; `EventResponseDto` |
| `GET /api/v1/resources` | `ResourceController.findAllResources` → `ResourceService.findAllResources` → `resource.findMany` + `count` | Public; title/type/level/isDraft/tagIds, `deletedAt: null`; tags; `ResourceResponseDto` |
| `GET /api/v1/resources/:id` | `findResourceById` → `resource.findFirst` | Public; `id`, `deletedAt: null`; tags; `ResourceResponseDto` |
| `GET /api/v1/blogs` | `BlogController.findAllBlogs` → `BlogService.findAllBlogs` → `blog.findMany` + `count` | Optional JWT; anonymous users limited to approved, published, non-draft, non-deleted blogs. Filters include title/category/author/draft/featured/category/tag. tags, authorUser, categoryData; `BlogResponseDto` |
| `GET /api/v1/blogs/:id` | `findBlogById` → `blog.findFirst` | Optional JWT; public visibility check for anonymous callers; tags, authorUser, categoryData; `BlogResponseDto` |
| `GET /api/v1/blogs/featured` | `getFeaturedBlogs` → `blog.findMany` | Public; featured approved non-draft, non-deleted blogs; unbounded |
| `GET /api/v1/blogs/published` | `getPublishedBlogs` → `blog.findMany` | Public; approved non-draft, non-deleted blogs; unbounded |
| `GET /api/v1/opportunities` | `OpportunitiesController.getOpportunities` → `OpportunityService.getOpportunities` → `opportunity.findMany` + `count` | Public; limit/offset/title/tagIds/status/moderationStatus; address/tags; `OpportunityResponseDto` |
| `GET /api/v1/opportunities/:id` | `getOneOpportunity` → `opportunity.findUnique` | Public; address/tags; `OpportunityResponseDto` |
| `GET /api/v1/organizations` | `OrganizationController.getOrgs` → `OrganizationService.getOrganizations` → `organizations.findMany` + `count` | Public; limit/offset/name/tagIds; address/tags and selected linked user; mapped `OrganizationResponseDto` |
| `GET /api/v1/organizations/:id` | `getOneOrganization` → `organizations.findUnique` | Public; address/tags/gallery and selected linked user; mapped `OrganizationResponseDto` |

Other public/controller domains are auth, users, tags, categories, projects, news, members, climate champions, testimonials, minutes, vacancies, analytics, notifications, email subscriptions, ImageKit, activity logs, AI assistant, and database export. No controller exposes a dedicated homepage endpoint.

## 3. Data model and query map

PostgreSQL + Prisma 6.4. Events, opportunities, and organizations optionally relate to `Address` and many-to-many `Tags`; events and organizations also have galleries. Blogs relate to optional author user/category and many-to-many tags. Resources relate to tags. Main content includes text fields (`description`, blog `content`, or resource `overview`), media URL/ID fields, timestamps, and workflow fields. Blog/resource use `isDraft` and `ContentStatus`; event uses `PublicationStatus`, `ContentStatus`, and `EventStatus`; opportunity uses `isDraft`, `ContentStatus`, and string status.

Schema-declared indexes exist for selected user, notification, AI, and activity-log patterns. No model-level secondary indexes are declared for Events, Opportunity, Blog, Resource, or Organizations beyond IDs; migration SQL and production database plans must still be inspected before asserting deployed index state. List reads use offset/limit and a separate count. Search uses Prisma full-text `search` plus `contains` for selected title/name filters, or `contains` for several blog/resource filters.

## 4. Public NCH frontend → CMS mapping

The frontend repository is not present here, so consumer call sites cannot be proven from this source tree. The source-supported CMS candidates for public NCH pages are the public endpoints above: Events → `/events` and `/events/:id`; Resources → `/resources` and `/resources/:id`; Blogs → `/blogs`, `/blogs/:id`, `/blogs/featured`, `/blogs/published`; Opportunities → `/opportunities` and `/opportunities/:id`; Organizations → `/organizations` and `/organizations/:id`. Confirm actual frontend URLs, request parameters, SSR concurrency, and cache headers from the frontend/deployment before treating this as a verified integration map.

## 5. Confirmed performance-sensitive patterns

- Public content lists default to a 100-item page through shared pagination DTO defaults; no maximum cap is enforced.
- Events, opportunities, and organizations await `findMany` then `count` sequentially. Resources and standard blogs issue these independent reads with `Promise.all`.
- Events, opportunities, and organizations list DTOs expose descriptive text; regular blog list output exposes `content` unless `excludeContent=true` is supplied.
- Featured and published blog reads are unbounded and include blog content and relations.
- Relevant lists eagerly load relations noted in the API map. This is evidence of relation payload/query work, not proof of N+1; Prisma query logging or traces are needed to determine emitted SQL.
- Every public read reaches Prisma from application code; no application/HTTP caching exists in the repository.

## 6. Hypotheses requiring measurement

- Missing secondary indexes may make sort/filter/count/search queries slow at production cardinality.
- Large page size, rich text, tags/address/gallery, and media metadata may make serialization and transfer noticeable.
- Public SSR waits may be dominated by CMS, PostgreSQL, network/deployment placement, media/external dependencies, or the frontend's orchestration. This repository alone cannot attribute it.
- The full-text-plus-`contains` OR search strategy needs `EXPLAIN (ANALYZE, BUFFERS)` against representative data.

## 7. Candidate optimizations (ranked provisional)

1. **Bound and right-size public list contracts** — high likely impact / high confidence / medium regression risk; requires frontend contract audit.
2. **Use parallel list/count work and consider count policy** — medium-high impact / high confidence / low-medium risk; validate pagination metadata.
3. **Slim list selections/DTOs, especially blog content and description fields** — high impact / high confidence / medium contract risk.
4. **Add response caching with explicit invalidation and HTTP cache policy for verified public reads** — potentially high impact / medium confidence / medium-high correctness risk.
5. **Design indexes from captured production query plans** — potentially high impact / medium confidence / migration risk; do not guess.
6. **Make featured/published blog endpoints paginated or deliberately capped** — high impact as data grows / high confidence / medium contract risk.

## 8. Validation strategy

Capture per-endpoint application latency, PostgreSQL query time/count, response byte size, DB plans, row cardinality, and cache headers across cold/warm requests. Test anonymous and authenticated visibility, filters, pagination metadata, detail payloads, mutation invalidation, and public frontend SSR end-to-end. Compare p50/p95 only with a documented load/data environment; never report invented benchmarks.

## 9. External/environment blockers

- No `.env`, database credentials, running configured services, or frontend source is available in this checkout.
- `node_modules` is absent; dependency installation was not authorized.
- `.env.template` has `DB_URL`, while Prisma/Joi require `DATABASE_URL`.
- Docker Compose runs migrations and is unsuitable for an unapproved generic local smoke test. Production port must align Nest `APP_PORT` with Compose's `3111:8080` mapping.

## 10. Completed work

Read-only discovery of framework/runtime, source architecture, public content API paths, Prisma schema/migrations, middleware/auth/validation/logging, scripts/tests, Docker/CI, and likely public CMS integration candidates. Created this tracker and `AGENTS.md` / `BACKEND_AUTOPILOT.md`.

### Implementation batch 1 — source-proven concurrency and projection work

- Changed Events, Opportunities, Organizations, and the equivalent public News list reads to execute their independent `findMany` and `count` calls together with `Promise.all`. Query filters, includes, ordering, offsets/limits, count metadata, serializers, and authorization/visibility semantics are unchanged.
- Changed both public Tags list reads in the same way and removed an unconditional full tag-array `console.log`. Their existing list/count predicates intentionally remain unchanged; the existing deleted-record count discrepancy is a separate compatibility/correctness decision, not part of this batch.
- Resources and normal Blogs already used `Promise.all`; no redundant concurrency change was made.
- Preserved the existing `blogs?excludeContent=true` opt-in projection. Blog relation reads now select only fields exposed by `AuthorOutputDto` and `CategoryResponseDto`, avoiding linked-user credentials/internal account fields and unexposed category fields before DTO serialization. This applies to list, detail, featured/published, and mutation response reads without changing returned DTO fields.
- Added a focused unit test asserting blog content exclusion and author/category selections.

## 11. Source-proven but deferred for compatibility

- Pagination stays at the existing uncapped default of 100. A cap would silently truncate consumers without a frontend/API contract decision. Parsing uses `parseInt` plus `@IsNumber`/`@Min(0)`; malformed and pathological request behavior needs runtime/API validation before changing shared DTO behavior.
- Default blog lists continue to include full `content` unless callers opt into `excludeContent=true`. Featured/published blog reads remain unbounded and include content/relations. Changing either default needs consumer verification and an explicitly versioned or opt-in contract.
- Events, Opportunities, Organizations, and Resources retain existing list relations and descriptive fields. No relation or response field was removed because frontend/card needs cannot be proven from this repository.

## 12. Still requiring production DB/query measurement

- Production query plans, actual indexes, row counts, deep-offset behavior, relation query count, connection-pool state, payload size, and endpoint latency attribution.
- Any index migration, pagination contract redesign, or relation/payload default change.

## 13. Still requiring a caching/freshness decision

No caching was added. Public-read caching needs a defined source of truth, TTL/HTTP policy, invalidation on all content mutations/moderation, and frontend freshness expectations.

## 14. Deferred work

No dependency installation, database connection, migration, benchmark, cache change, API contract change, or Git history/remote mutation has been performed. Start only after approval and measurement access.
