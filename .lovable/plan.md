## Why show data is stale

Looking at the database, most shows haven't been refreshed since **July 2025** (today is May 8, 2026), even though a cron job is configured to run every 12 hours. After inspecting `supabase/functions/update-shows/index.ts` and the `cron.job` table, I found three concrete problems.

### Problem 1: The edge function crashes on every invocation

The function declares `const today = new Date()` **twice** in the same scope:

```ts
const today = new Date();
const airedSeasons = showDetails.seasons?.filter(...)
...
const today = new Date();   // ← duplicate declaration
const releasedEpisodes = seasonDetails.episodes?.filter(...)
```

This is a runtime `SyntaxError: Identifier 'today' has already been declared`. The function fails immediately for every show, which explains why there are no recent edge function logs and no recent `updated_at` timestamps.

### Problem 2: The "which shows to refresh" filter is too narrow

```ts
.or("updated_at.is.null,updated_at.lt.2024-01-01,retry_count.lt.3")
```

The intent was "stale shows", but `updated_at.lt.2024-01-01` excludes anything updated in 2024+. The filter only works because of the `retry_count.lt.3` clause — and once any show ever hits `retry_count >= 3`, it would never be picked again. The selection should be based on "not updated in the last N hours".

### Problem 3: No on-demand freshness when a user opens a show

Even with a working cron, a show could be up to 12 hours stale. There's no "refresh on view" path, so the modal can show outdated counts right after a new episode airs.

---

## Plan

### 1. Fix `supabase/functions/update-shows/index.ts`
- Remove the duplicate `const today = new Date()` declaration (keep one at the top of the per-show handler).
- Replace the `.or(...)` filter with a proper staleness query: shows where `updated_at IS NULL` **or** `updated_at < now() - interval '6 hours'`, still ordered by oldest first, still capped at 50 per run, still skipping shows with `retry_count >= 5`.
- Also refresh shows that are still "in production" more aggressively (every run) versus ended shows (once per week), so finished series don't crowd out active ones.

### 2. Increase cron cadence
- Update the existing `auto-update-shows` cron job from `0 */12 * * *` (every 12 h) to `0 */2 * * *` (every 2 h). With 50 shows per run and ~60 shows in DB, every active show gets touched within a few hours.

### 3. Add an on-demand refresh when opening a show
- In `src/components/ShowDetails.tsx` (or its hook), when the modal opens for a show whose `updated_at` is older than ~1 hour, invoke `update-shows` with a `{ showId }` payload.
- Extend `update-shows` to accept an optional `showId` and refresh just that one show synchronously, returning the new counts so the UI can update immediately.

### 4. Surface freshness in the UI
- In the show details modal, show a small "Last updated: X ago" line and a manual "Refresh now" button that calls the same single-show path. This gives the user an escape hatch when TMDb has data the cron hasn't picked up yet.

### 5. Verify
- After deploy, re-check `shows.updated_at` (should all be recent) and the edge function logs (should show successful runs, no `SyntaxError`).

### Technical details
- Files to change:
  - `supabase/functions/update-shows/index.ts` — fix duplicate declaration, new selection query, optional `showId` branch.
  - `src/components/ShowDetails.tsx` and/or `src/hooks/show/useShowDetails.ts` — trigger on-demand refresh + display last-updated.
  - SQL migration / direct SQL to update the `cron.job` schedule for `auto-update-shows`.
- The `shows` table already has `updated_at`, `retry_count`, `last_error` — no schema change needed.
- RLS: the edge function uses the service-role client (`_shared/supabase-client.ts`), so updates continue to work despite the SELECT/INSERT-only public policies.
