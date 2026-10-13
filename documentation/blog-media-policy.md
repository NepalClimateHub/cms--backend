# Blog media policy

## Model
- `Media` row per ImageKit URL (`url` unique): owner, optional blog, kind `BANNER`|`INLINE`, alt, caption, credit, status `ACTIVE`|`ORPHANED`.
- Rows are derived server-side from sanitized blog content plus `bannerImageUrl`; client-sent metadata is never trusted.
- Only `https://ik.imagekit.io/` URLs are tracked. Other banner URLs are stored on the blog but not as media.

## Ownership
- The row owner is the uploader: the author, or the blog author when staff edit.
- A non-staff user referencing a URL owned by another user is rejected with 403 before anything is written.
- `SUPER_ADMIN`, `ADMIN` and `CONTENT_ADMIN` may reference any media. Existing rows never change owner.

## Cleanup
- A URL dropped from content or banner on update is marked `ORPHANED`; re-referencing it sets it `ACTIVE` again.
- Soft-deleting a blog marks all of its `ACTIVE` media `ORPHANED`.
- Nothing is ever deleted from ImageKit or the `Media` table by the API. `ORPHANED` rows are only candidates for a future, manual purge.
- A URL belongs to one blog at a time; the most recent blog to reference it claims it.

## Limits
- alt 300, caption 500, credit 200 characters, validated per image on every create and update.
