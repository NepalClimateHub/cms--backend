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

## 15. PUBLIC FRONTEND ↔ CMS CONTRACT

Verified 2026-09-29 against the `NepalClimateHub` Astro source (branch
`perf/homepage-core-web-vitals`). This supersedes the provisional mapping in
section 4. The public frontend has no client-side CMS re-fetch for these
domains: all active requests below run during Astro SSR (or an XML endpoint)
and block that response. React islands receive pre-fetched props and filter/
paginate locally.

| Domain | Active frontend request graph and record count | Backend path / fetch | Frontend-required response fields | Confirmed not used by this public frontend | Decision |
| --- | --- | --- | --- | --- | --- |
| Events | `/events`, homepage featured, event detail, and events sitemap each make an independent unparameterized `GET /api/v1/events`; current shared default is up to 100. Detail title-slug scans the list and reuses it for four related cards. `/events` passes the full collection to `EventFilter client:load` for local filters/pagination. | `EventsController.getEvents` → `EventsService.getEvents`: filters title/tagIds/status/publicationStatus/moderationStatus; `findMany` + `count` in parallel, createdAt desc, skip/take, complete address and tags. `/:id` additionally includes gallery but is unused by public Astro. | List: id, title, type, locationType, status, format, cost, description, bannerImageUrl, address.state, tags[].tag. Detail additionally uses organizer, location, startDate, registration deadline/link, contact email, website, and named social links. Homepage needs id/title/locationType/description/banner/tags. | list meta.count; contributedBy, bannerImageId, moderation/publication workflow fields, address except state, tag metadata except `tag`; event gallery is not received. | **BREAKING/DEFER** default reduction: complete local filtering and slug resolution rely on the collection. **COORDINATED** opt-in summary plus slug/addressable detail and related limit. **BACKEND COMPATIBLE** Prisma root scalar select can omit DB-only timestamps/FKs/review fields while preserving DTO JSON; requires focused snapshot validation. |
| Blogs | `/blogs`, blog detail, and blog sitemap use `GET /api/v1/blogs?excludeContent=true`; current count remains the backend default up to 100. Detail sequentially lists to resolve title slug and derive three Top Reads, then calls `GET /blogs/:id` for body/author detail. `BlogCategoryFilter client:load` filters the list prop locally. No active homepage Blog request; featured/published helpers/components are unreferenced. | `BlogController.findAllBlogs` → `BlogService.findAllBlogs`: anonymous predicate approved/published/non-draft/non-deleted, filters, createdAt desc, parallel findMany/count, omit content only with flag, tags and selected author/category. Detail uses `findFirst` + visibility check; featured/published are unbounded but inactive in this frontend. | List cards: id/title/excerpt/author/authorUser.profilePhotoUrl/readingTime/category/publishedDate/bannerImageUrl; `isFeatured` selects highlight. Detail summary also needs isTopRead and top-read card fields. Detail response needs title/content/excerpt/author/date/time/banner/tags[].tag and conditional author profile/social linkedin/bio/role. | List: content; tags metadata; categoryData; author id/socials/currentRole/fullName/email/bio except profile photo; bannerImageId/workflow/review/timestamps/categoryId. Detail: categoryData, category copied but unrendered, author id/fullName/email. | **SAFE NOW implemented in frontend:** use existing `excludeContent=true`, so DB/API/network body no longer carries list content that old frontend code stripped after receipt. **COORDINATED:** opt-in summary/slug lookup eliminates sequential detail collection scan. **BREAKING/DEFER:** lower default/cap or alter featured/published defaults. |
| Resources | `/resources` makes unparameterized `GET /api/v1/resources` (up to 100) and passes a seven-field mapped collection to `ResourceFilter client:load`; no resource detail route exists, and resource cards link externally. | `ResourceController.findAllResources` → `ResourceService.findAllResources`: deletedAt predicate plus title/type/level/draft/tag filters, createdAt desc, parallel findMany/count, complete tags. | id, title, overview, link, type, level, bannerImageUrl (banner conditional). | courseProvider, platform, duration, author, publicationYear, bannerImageId, isDraft, tags, timestamps, meta.count. | **BREAKING/DEFER** lower default: client filtering requires current collection. **BACKEND COMPATIBLE** select DTO fields only, omitting DB-only status/review/deleted fields while retaining response. **COORDINATED** opt-in seven-field summary/no-tags projection. |
| Opportunities | homepage, `/opportunities`, detail, and sitemap make unparameterized `GET /api/v1/opportunities` (up to 100). Listing filters/paginates locally. Detail title-slug scans the collection; formerly its related component requested the identical collection again. | `OpportunitiesController.getOpportunities` → `OpportunityService.getOpportunities`: title/tag/status/moderation filters, createdAt desc, parallel findMany/count, complete address/tags. `/:id` exists but is unused. | List: id/title/type/locationType/address.state/status/format/cost/description/tags[].tag/banner. Detail additionally needs duration, application deadline, website URL, socials, contact email. Homepage cards need title/location/address.state/description/tag/banner. | meta.count; tag metadata except tag; address except state; bannerImageId, moderation/isDraft, organizer/location for active list cards. ORM also reads DB-only contributedBy/timestamps/deleted/review fields. | **SAFE NOW implemented in frontend:** detail reuses its resolved collection for related cards; exact current card choice/order remains. **BACKEND COMPATIBLE** root/nested selects can omit unexposed scalars/address city while preserving DTO JSON. **COORDINATED** summary/slug projection or slug detail endpoint; do not lower default. |
| Organizations | **No public CMS call.** `/organizations`, homepage feature, and prerendered detail all read `src/data/organizations.json`; list hydrates local compact props for pagination. | Backend list remains controller → service `findMany` + count, full address/tags/selected linked user; detail adds gallery. It is not on the active public frontend request graph. | Static JSON contract: list id/name/description/address/tags/logoUrl/slug; detail also pictures/contact/full local object. | All CMS organization response fields are unused by this frontend, but this is not evidence that external API consumers do not use them. | **DEFER:** do not change public response/defaults from this frontend evidence. **BACKEND COMPATIBLE** root scalar select can omit ORM-only verification/type/timestamp columns after response snapshot validation. CMS migration needs an explicit shape, slug, visibility, and static-generation decision. |

### Verified orchestration and compatibility notes

- All active list callers omit page/limit/filter/sort parameters and consequently
  rely on `PaginationParamsDto.limit = 100`; none is safe to reduce without a
  coordinated paging/filter design. Homepage featured sections also filter
  eligibility after fetching, so a naïve `limit=4` is not equivalent.
- Existing direct detail endpoints for events/opportunities are unused because
  public routes are title-slug based, not ID based. Blog detail needs the list
  before its ID detail call for the same reason.
- List relations are broader than public use: all five active CMS lists send
  complete tag objects; events/opportunities send full addresses though only
  `state` is read; resource tags are entirely unused. Removing those fields is
  a response-shape change and is deferred pending an opt-in projection.
- No cache was added. Caching still requires public freshness, mutation/
  moderation invalidation, and HTTP policy design. Index work still requires
  representative production plans, cardinalities, and timings.

### Implementation pass 2

- Frontend `fetchAllBlogs` now asks the existing compatible
  `?excludeContent=true` API projection. Previously it downloaded complete
  bodies (potentially base64 HTML) and removed them locally with a streaming
  transform. Detail continues to fetch `/:id` for the sole full body. This
  changes no backend default or response contract for other consumers.
- Opportunity detail now supplies its already fetched list to
  `FeaturedOpportunitySection`, eliminating its nested identical SSR request.
  The component retains its fallback fetch for homepage/current callers and
  preserves the current related-card ordering/selection.
