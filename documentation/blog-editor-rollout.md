# Blog editor rollout and media operations (OPS-01)

Scope: backend sanitizer + Media table, NepalClimateHub render/preview, CMS editor. Contract: `/mnt/code/NCH/BLOG_CONTENT_CONTRACT.md`. Media rules: `./blog-media-policy.md`.

## Media lifecycle and retention
| Event | Effect |
| --- | --- |
| Create/update references ImageKit URL | Row upserted, `ACTIVE` |
| URL dropped from content or banner | `ORPHANED` |
| URL re-referenced | back to `ACTIVE` |
| Blog soft-deleted | all its `ACTIVE` media -> `ORPHANED` |
| Any API path | never deletes ImageKit files or `Media` rows |

- `ORPHANED` rows are candidates for a future manual purge only. No purge job exists.
- ImageKit cleanup is not covered by automation or tests.
- Only `https://ik.imagekit.io/` URLs are tracked as media.

## ImageKit permissions and folders
- Uploads: editor requests a fresh ImageKit auth per upload; no blob/data URLs persist.
- Owner = uploader (author, or blog author when staff edit). Existing rows never change owner.
- Non-staff referencing another user's URL -> 403, nothing written.
- `SUPER_ADMIN`, `ADMIN`, `CONTENT_ADMIN` may reference any media.
- Folder layout: not defined in the source docs; confirm with the ImageKit config before go-live.

## Content validation (backend, all create/update)
- Sanitized against contract allowlist; hostile markup stripped, text kept.
- Limits: content <=500,000 chars; <=100 `<img>`; alt <=300, caption <=500, credit <=200. Violation -> 400.
- `img src` must be `https://ik.imagekit.io/`; other hosts rejected.
- Site re-sanitizes blog content at render (`contentKind="blog"` only; events/news/projects unchanged).

## Content migration
- Legacy `<img caption>` / `.image-caption` content: read-only in editor, still renders.
- Bulk conversion NOT approved. Required sequence (BLOG_LEGACY_MIGRATION.md):
  1. Backup all posts to JSON outside repo; verify count + checksum.
  2. `planLegacyConversion` dry run; spot-check 10 diffs.
  3. Apply with sign-off, only `changed` items, batches of ~20, stop on first non-2xx.
  4. Verify: re-plan shows 0 changes; text equality before/after.
  5. Keep backup for one release cycle.

## Rollout order
1. Backend: verify and apply `20261010120000_blog_media/migration.sql`, then deploy. Sanitizer is backward compatible; response shapes unchanged.
2. Site: deploy sanitized render + `/blog-preview`; set secret `CMS_PREVIEW_ORIGINS` (`wrangler secret put`). Default deny until set.
3. CMS: deploy with build var `VITE_PUBLIC_SITE_URL`; unset -> preview shows "Preview unavailable".
4. Staging e2e: `npm run test:e2e` in cms--frontend. Env: `E2E_CMS_URL`, `E2E_SITE_URL`, `E2E_API_URL`, `E2E_EMAIL`, `E2E_PASSWORD`; optional `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_PARITY_URL`.
5. Legacy conversion: only after step 4 passes, dry run, backup, sign-off.

## Migration safety
- `20261010120000_blog_media/migration.sql` is hand-written and NOT diff-verified or applied.
- Required before `migrate deploy`: `prisma migrate diff` and manual review.
- docker-compose runs `migrate deploy` on boot: do not smoke-test against a shared DB.

## Rollback
| Component | Action |
| --- | --- |
| Backend | Redeploy previous image; `Media` table is additive, leave in place |
| Site | Redeploy previous build; old figure markup still renders |
| CMS | Redeploy previous build; restores old editor |
| Legacy conversion | PATCH `{ content: html }` from backup JSON per id |
| ImageKit | Never delete assets on rollback |

## Monitoring
- 400 rate on blog create/update (sanitizer, size, image cap).
- 403 rate from media ownership checks.
- Count of `ORPHANED` media (growth trend).
- Author reports: autosave failure, conflict banner.
- Site preview 403 / 413 / 405 rates (`/blog-preview`).
- ImageKit auth and upload error rate (CMS).

## Known caveats
- Migration unverified (see above).
- Jest `auth.controller.spec` pre-existing failure (jwt.util import); not caused by this work.
- Autosave conflict check is check-then-write with no If-Match: small race window.
- HtmlRenderer sanitization is blog-only; other content types unchanged.
- Non-ImageKit hosted images rejected by sanitizer.
- Real clipboard/OS drag, crop canvas, rendered widths, preview iframe at device widths: browser-only, manual or E2E.
- E2E publish step needs an admin account unless `E2E_EMAIL` is a content admin.

## Author guidance
- Add alt text to every image (required before submit-for-review or publish).
- Pick layout: inline, wide, full, or two-up. Add caption/credit where useful.
- Wait for uploads to finish; save is blocked while any upload is pending or failed.
- Retry failed uploads with Retry; do not re-paste.
- Banner: replace or remove via banner control; removal orphans the old image.
- Drafts autosave. Published blogs keep a local snapshot: use Restore or Discard.
- Published edits need an explicit Save.
- Preview before publishing.
- If the conflict banner appears, reload and reconcile before saving.
