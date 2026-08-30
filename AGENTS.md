# AGENTS.md

Notes for coding agents working on this repo, based on lessons learned while
building the "Walk in Wonder" hike-a-thon blog post series.

## Dev server

- `make dev` just runs `pnpm run dev`. Run it in a long-lived terminal pane,
  not in a foreground command that blocks the agent.
- If you hit stale-cache weirdness (504 "Outdated Optimize Dep", or CSS not
  showing up in prod build), clear `.astro`, `dist`, `node_modules/.astro`,
  and `node_modules/.vite`, then fully stop and restart the dev server
  (a config-file-triggered auto-restart is not enough — it can come back up
  with an empty content collection; kill it and start fresh).

## Astro content collections

- Posts live in `src/content/posts/*.mdx`. The slug is derived from the
  `created` frontmatter date + filename (see `getPosts()` in `src/lib/utils.ts`).
  If you change a post's date, **rename the file too**, or you'll get a
  doubled-date slug.
- To publish a post's page (so it's reachable/built/in the sitemap) but hide
  it from the front page and RSS feed, set `index: false` in frontmatter.
  Don't use `draft: true` for this — that suppresses the build entirely.
  This mirrors the existing Advent-of-Code post pattern.
- The `excerpt` frontmatter field exists in the schema but is intentionally
  **not rendered anywhere** in `src/layouts/Page.astro`. Don't re-add
  excerpt-as-subtitle rendering without being asked.

## MDX gotchas

- Raw HTML blocks in MDX still get auto-wrapped in a `<p>` by
  remark/rehype. If you wrap something in your own `<p style="...">`, you'll
  get invalid nested `<p><p>...</p></p>`. Use `<div style="...">` as the
  outer wrapper instead — remark will put its own `<p>` inside the `<div>`,
  which is valid HTML.

## Gallery component (`src/components/Gallery.astro`)

- Built on GLightbox (not PhotoSwipe — we switched because GLightbox
  defaults to captions *below* the media and has native `<video>` support).
- Accepts `images: {src, alt, type?, poster?}[]` — image items are
  `{src, alt}`; video items are `{type: 'video', src: '/video/x.mp4', poster, alt}`.
- **CSS override gotcha**: global CSS overrides for third-party classes
  (e.g. GLightbox's caption styling) must go inside the component's single
  scoped `<style>` block using `:global(...)` selectors. A separate
  `<style is:global>` block gets **silently dropped** from the production
  build in this repo, because of the `build: { format: 'file' }` Astro
  config setting (something about how Vite bundles CSS in that mode). This
  took a long debugging session to root-cause — don't reintroduce a second
  style block.

## Working with Immich for photo/video sourcing

- Search assets in an album:
  `POST /api/search/metadata` with body `{"albumIds": ["<id>"], "size": 50}`.
  The response items include `fileCreatedAt` and `originalFileName`, but
  **not** `exifInfo` — for descriptions/captions or EXIF dates, call
  `GET /api/assets/{id}` per-asset instead (`exifInfo.description`,
  `exifInfo.dateTimeOriginal`).
- **To get the user's cropped/edited version of a photo** (not the
  as-shot original), use:
  `GET /api/assets/{id}/thumbnail?edited=true&size=fullsize`
  — and follow redirects (`curl -L`)! If Immich hasn't cached a fullsize
  render of the edit, it 302-redirects to a cached `size=preview` (smaller,
  e.g. 1440px) version instead of 404ing. Always check `isEdited` on the
  asset (`GET /api/assets/{id}`) — if it's `false`, this endpoint just
  returns the small preview-sized fallback, so fetch `/original` instead
  for full resolution.
- Screenshots (GPS traces, maps) are generally not "edited" in Immich's
  sense even if the user considers them "already cropped" — ask if in doubt,
  but `/original` has worked fine for those so far.
- Use `fileCreatedAt` (not EXIF) to determine actual capture date/time when
  ordering photos or double-checking a hike's date — screenshots/exports
  added after the fact (e.g. a GPS-trace screenshot exported two days later)
  are outliers and shouldn't be used to date the hike; use the cluster of
  real photos instead.
- When a post doesn't have its own captions, but Immich descriptions exist
  and are numbered, use those numbers for ordering. When both exist, prefer
  the post's own captions/order over Immich's. When the user says "use the
  captions I already put on the photos," pull `exifInfo.description` verbatim
  per-asset rather than writing new ones.

## Image/video processing conventions

- After downloading, always run:
  `mogrify -auto-orient -resize '2400x2400>' -quality 85 <file>`
  before saving into `src/images/`.
- Filename convention: short per-hike prefix + descriptive slug, e.g.
  `sh-` (Springhill), `sp-` (Secrest Preserve — note: not the same as
  Springhill's `sh-`, easy to mix up), `ll-` (Lost Lake), `jrs-` (Jack R.
  Smiley), `cf-` (Conservancy Farm), `sib-` (Sibley Prairie), `lf-` (LeFurge
  Woods).
- Videos go in `public/video/*.mp4` (not `src/`), transcoded to H.264/AAC.
  For normal clips, CRF 23 is fine. For high-motion/high-detail "b-roll"
  (e.g. grass or leaves blowing in wind), CRF 23 produces excessive file
  sizes (40+ Mbps) — instead use `fps=30`, scale to ≤960px width, `CRF 26`,
  `maxrate 2500k`, `bufsize 5000k`, `aac 96k`. Generate a poster frame with
  ffmpeg and save it as `src/images/<prefix>-<name>-poster.jpg`.

## Hike-a-thon post structure (if adding more in this series)

Each post follows this shape:
1. Frontmatter: `title` (preserve name only), `tags: [nature, hiking]`,
   `index: false`, `created` (real hike date, from photo `fileCreatedAt`).
2. Imports: `Gallery` component + one import per image/video asset.
3. Italic ordinal + link line near the top:
   `_Nth of seven hikes in the <a href="/2026-08-29-walk-in-wonder">Walk in Wonder 2026 hike-a-thon</a>._`
4. Body paragraphs (verbatim from the user's Instagram-style caption text,
   lightly adapted — e.g. "(link in bio)" doesn't make sense on a website,
   so it gets turned into a real inline hyperlink instead).
5. `<Gallery>` component.
6. Right-aligned "next hike" link at the very bottom (only if the next hike
   in the series already has a post):
   ```
   <div style="text-align: right">
     Next hike: <a href="/slug-of-next-post">Next Preserve Name →</a>
   </div>
   ```
   The arrow goes inside the `<a>` text, not after it.
- The **index post** (`2026-08-29-walk-in-wonder.mdx`, slug intentionally has
  no `-index` suffix — trimmed per request) has an ordered list linking to
  every hike post; keep it and the ordinal numbers / next-hike chain in sync
  whenever a hike's date changes (reordering can cascade through several
  posts — see below).
- **Dates can and do change mid-session.** When a hike's `created` date
  changes such that it moves relative to other hikes, you must: rename the
  file, update `created`, renumber the ordinal ("Nth of seven") on every
  affected post, fix the "Next hike" link target on the post *before* it in
  the new order, fix its own "Next hike" link target, and update the index
  post's ordered list. Always rebuild and grep the output to confirm
  ordinals/links/index are consistent after any reordering.
