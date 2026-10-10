---
status: shaped 2026-10-09 — not built
phase: L7b — News (plan/launch.md; L7 split: L7a media, L7b news)
shaped_with: Florian, 2026-10-09 (grill-with-docs)
base: main with L7a merged (PR #30)
---

# L7b — News

The board writes **news posts** in the club app's own **news workbench** and publishes them to the
website's `/news`, `/news/:slug` and the landing teaser — which today run on seeds. Built whole, no
drop: the workbench is a visual highlight of the club app, not a form. `CONTEXT.md` carries the
terms: **News**, **News post**, **News category**, **News workbench**, **Mention**, **Teaser**,
**Media item** (the **news picture**), **Lead post**.

Read first: `CONTEXT.md` → the terms above, **Event**, **Album**, **Public selection**, **Portrait**,
**Group picture**, **Managing login**, **Person deletion**, **Session**; ADR-0010, ADR-0021,
ADR-0022, ADR-0025, **ADR-0026**; `plan/website/feature-news.md` (the public face as built);
`plan/launch/l7a-media-store.md` (owners, crop frame, public picture URLs);
`plan/launch/l6-public-events.md` (workbench precedent, deleting seeds).

---

## What was ruled on 2026-10-09

1. **Built whole, never dropped.** L7b is no longer the launch's designated drop (Florian: "we have
   much time"); no slice is optional.
2. **One key `news.manage`** — write, publish, withdraw, delete. No author/publisher split.
3. **Lifecycle: draft → published → withdrawn**, republishable. Drafts are seen only in the
   workbench. No scheduled publishing, no backdating.
4. **Author = whoever started the draft**; editing or publishing by others changes nothing. The
   byline names her person; started by the **managing login**, or author erased → no byline.
5. **Workbench only in the club app.** Members read news on the website; no Start panel, no
   to-do, no mail or push on publish (13). The workbench is a **Mehr** entry at `/news`, gated by
   `news.manage`, like *Veranstaltungen* and *Galerie*.
6. **At most one news picture**, uploaded or picked from the gallery — picking **copies** into a
   media item the news post owns (new owner kind; L7a ruling 3). Cropped to the website's banner
   aspect with `KkCropFrame`, re-croppable without re-upload; an optional **caption** carries the
   photo credit and replaces `heroCaptionNote`. No pictures inside the text. No picture → the
   shipped `NewsPoster`.
7. **Ties: one event and one album, each optional.** The article shows an event card
   (`/events/:slug`) and a picture strip of the album's public selection (`/gallery/…`). A tie the
   website can no longer show — album unpublished, event deleted — drops from the public face;
   publishing is never refused for it.
8. **Address and date fixed at first publication.** Slug derived from the title then (collision →
   `-2`), `publishedAt` = that moment; a later title change or republishing changes neither.
9. **Mentions** of groups shown publicly and of persons holding a public board seat — the `@`
   picker offers only those. On the website a mention opens a small card in place: group picture
   (tone fallback), name, short description, link to the group on `/club`; or portrait, name,
   office. When the target stops being public or is erased, the mention renders as its label in
   plain text; erasure never rewrites authored text.
10. **Text = a fixed set:** paragraphs, one level of subheading, flat unnumbered lists, bold,
    external links (new tab, marked external), mentions. No italics, quotes, tables, embeds,
    colours. The **teaser** is a separate, required, plain-text field (cards, lead post, SEO
    description, link previews).
11. **Storage (ADR-0026):** the text is a strict Markdown subset in a `text` column; mentions are
    also rows of `news_post_mention` (FKs, rewritten on save, cascade on erasure / group deletion).
    One parser per side, nothing ever interpreted as HTML, the server refuses anything outside the
    subset.
12. **Pending changes.** Drafts save automatically. Edits to a published post go to **one shared
    working copy** (autosaved, marked *Änderungen offen*), live only on *Änderungen veröffentlichen*,
    or dropped by *Verwerfen*. Concurrent edits: last write wins, with a hint when someone else
    saved in between.
13. **Categories: the four fixed ones** (Session · Erfolge · Verein · Gruppen), hard-coded; required
    to publish, optional in a draft. Publishing needs title, teaser, text and category.
14. **Deletion:** only drafts and withdrawn posts, for good, no bin, the news picture with them; the
    slug is freed and the old URL 404s. A published post must be withdrawn first.
15. **No archive.** `/news` shows everything: the current session as today (lead post + *Weitere
    Meldungen*), then each older session as its own section with a session header and compact rows.
    The archive button, its footer clause and `resolveArchiveSession` are removed.
16. **The workbench is a visual highlight**, found by an orchestrated design exploration (like L7a
    S5) under four theses: **writing happens on the finished page** (the editor *is* the article in
    website form — Anton title, teaser, picture with crop, text with `@`); **"where will it
    appear?" in one view** (live lead post, list row, landing card and WhatsApp link preview of the
    same post); **publishing is a moment** (showpiece staging, confetti in full every time); **the
    hub is a dense session timeline** of drafts, *Änderungen offen*, live and withdrawn. Everything
    else creative is the design team's call.

Defaults taken without a ruling: a withdrawn or unknown slug lands on the site-wide branded 404;
the news picture's public face is unsigned under `/api/public/news/pictures/…`, served only while
its post is published (ADR-0025's public face gains a fourth member); `og:image` is the news
picture's large rendition; the website seeds in `news-content.ts` are deleted once it reads the API.

Defaults taken while building S1 (2026-10-09): edits go to the working copy only while a post is
live — a draft or a withdrawn post is saved directly; **withdrawing adopts the working copy** as the
post's content (nothing is public any more), so a withdrawn post never has pending changes;
publishing is idempotent and doubles as republishing; every save and transition counts a
`revision` up, and a save based on an older revision still wins but answers `savedInBetween`;
mention rows are written only for targets that exist, and a mention is never refused for its target
(an erased person's mention must survive autosave) — public-ness is checked when rendering; an
album tie must be published when it is newly chosen, a kept tie is never re-checked; the
workbench's pickers are `GET news/mentionables` and `GET news/tie-candidates` (every event, live
published albums); a backslash escapes ASCII punctuation in the text (ADR-0026 amended).

S3 verdict (Florian, 2026-10-10): the prototype is the **base**, built with more quality and eye
to detail throughout; the name "Narrenpresse" is dropped (no name in the UI); the publish moment
plays in full — confetti included — **even under reduced motion**; the website's news surfaces
(lead post, list row, landing card) move into `@furria/ui` in S5, so the previews are the real
components and the website consumes them.

---

## Slices

Each slice ends with the validation in `CLAUDE.md` ("End of a slice/task") and its row updated here.
Each slice is built by a fresh session.

| # | Slice | Content | Status |
|---|---|---|---|
| S1 | **News backend** | `NewsPost` (title, teaser, text, category, author, slug, `publishedAt`, state *draft/published/withdrawn*, pending working copy), `news_post_mention`, event and album ties; `news.manage` in `FurriaPermissions`; the subset validator and mention extraction (ADR-0026); `manage/news` endpoints: list (timeline by session), get, create, autosave draft / working copy, publish (preconditions 13), publish pending changes, discard, withdraw, republish, delete (14); slug and date fixing (8); erasure and group deletion behaviour (4, 9); mention picker source (public groups, public board seats) (rulings 2–4, 7–9, 11–14) | built 2026-10-09 |
| S2 | **News picture (backend)** | `MediaOwnerKind` news post; tus upload with owner `news:{id}`, banner crop, re-crop; *pick from gallery* = server-side copy of a gallery item into a news-owned item; caption; delete with the post; unsigned public renditions in `PublicMediaService` while published; ADR-0025 amended (ruling 6) | built 2026-10-09 — migration `NewsPictures`: `media_item.owner_news_post_id` (cascade) and owner kind `NewsPost` (tus owner `news:{id}`, `news.manage`, photos only, aspect 2:1 held by the worker, `uncropped` rendition for the re-crop frame); `news_post.picture_id` / `picture_caption` and `pending_picture_id` / `pending_picture_caption` — **the picture follows the working copy** (Florian, 2026-10-09): on a live post an upload, gallery pick, re-crop or removal lands in the working copy (starting it from the live version), goes live with *Änderungen veröffentlichen*, is dropped by *Verwerfen*, adopted on withdrawal; re-cropping the live picture cuts a server-side copy, so the public picture never changes under the reader; a news post owns only its picture and its pending picture — any other item it owns is deleted with its files on every change; `PUT news/{id}/picture/crop`, `DELETE news/{id}/picture`, `POST news/{id}/picture/from-gallery` (`galleryItemId` + crop, a ready photo in a live album, inbox and bin refused; the copy keeps the uploader); the caption travels with the autosave (`PUT news/{id}` `pictureCaption`); `GET news/{id}` carries `picture` (state, signed URLs, uncropped URL, crop) and `pictureCaption` per version; picture changes count the revision up; deleting a post deletes its pictures' files; `GET /api/public/news/pictures/{mediaItemId}/{small\|medium\|large}` served only while the picture is the live picture of a published post (ADR-0025's fourth member); the public URL builder follows in S6 |
| S3 | **Workbench design exploration** | Orchestrated specialist team (UX, UI, motion, editorial/typography, IA, a11y) → judges → critics → **one distilled, built lab prototype** of the hub timeline, the on-page editor with `@` mentions and picture crop, the appearance previews and the publish moment, pitched to Florian (ruling 16). Independent of S1–S2 — **start right after this plan is committed** | built 2026-10-09 — lab prototype **"Die Narrenpresse"** at `/lab/news` (six specialist pitches all landed on the print shop; judges kept the one non-obvious twist: **state = registration of a three-plate press**, ink/KK red/gold, Narrenzeitung, no letterpress nostalgia; critics cut jargon from buttons, the hub flap strip, whole-page misregister and an 8-beat medley). **Hub:** *Druckplan* rail (one timeline across sessions, a tick per post: ink live, red-offset pending, struck withdrawn, gold drafts above the line; tap scrolls to the row), *Entwürfe* band, a section per session, uniform dense rows (`KkRegisterMark` + state word, 2:1 thumb, Anton title, category, date, one fact line: `fehlt: …` / `Änderungen offen · 12:02` / `zurückgezogen …`). **Editor** = the website article on a trimmed sheet: category as kicker menu, dateline with the locked address once fixed, Anton title field, teaser as a ProseMirror lead with inline ✂ cut ticks where Karte / WhatsApp / Aufmacher cut it, 2:1 picture desk (upload with progress → *wird entwickelt* → crop in place with `KkCropFrame`, gallery pick, caption as credit line), text as one ProseMirror host on the ADR-0026 schema (format rail exactly the subset: ¶ Z • F ↗ @, shortcuts, paste reduced to the subset, `@` combobox of public groups / board seats, atomic mentions with editable label, non-public struck), ties as dashed slots at the article foot (*fällt auf der Website weg* + *Lösen*); changed parts and text blocks carry a red margin rule + *geändert*; missing fields get *fehlt* marks and a scroll on publish. **Ausschießen**: desktop right sheet with Aufmacher, Listenzeile, Startseiten-Karte, WhatsApp, live, real clamps with *gekürzt* lines; phone 4-up strip opening a sheet. **Pressleiste** (custom shell foot; on phone with the text focused it becomes the format rail): register mark + state word, save line, foreign-save hint, readiness slots only while something is missing, actions per state, **press-and-hold 700 ms** to publish (keyboard / assistive click → confirm). **Andruck**, full every time: plates register while the server answers (slip + shake, no confetti on failure), strike + ink roll, cut along the trim + confetti, *GUT ZUM DRUCK* stamp signed with name · date · time, slug and date flap in at the first publication (*AKTUALISIERT* otherwise), LIVE ticks land on the four placements; withdrawing stamps *ZURÜCKGEZOGEN*. Lab sheet: failing server, network off, *Jemand speichert dazwischen*, *Anderswo gelöscht*. Kit: ProseMirror deps in the catalog; new `@furria/ui` primitives (`KkRegisterMark`, `KkProofSheet`, `KkProseField`, `KkFormatRail`, `KkMentionPicker`/`Editor`, `KkBannerDesk`, `KkCaptionField`, `KkTieSlot`, `KkEventTie`, `KkAlbumTie`, `KkKickerMenu`, `KkDateline`, `KkHeadlineField`, `KkPressBar`, `KkPressPlan`, `KkPressRow`, `KkPressSectionHeader`, `KkPressStage`/`Stamp`, `KkHoldButton`, `KkDiagonalStamp`, `KkNewsPoster`, `KkNewsCategoryChip`, `KkNewsProof`, `useKkTextMeasure`), `KkScreen` gains a `foot` for working screens, the shell's foot measurement now observes a late-mounted node. **API gaps for S5:** summary lacks picture thumb, ties, `pendingSavedAt`, `withdrawnAt`; no `updatedBy` (the foreign-save hint names a person); publish returns 204 (staging wants slug/date back); mentionables lack group tone and portrait; ties lack cover/count for faithful cards. **Open for Florian:** verdict; reduced motion (kit hides confetti under the OS setting); website news surfaces moving into `@furria/ui` so previews are the real components (S5/S6) |
| S4 | **Text subset (web)** | One parser for the subset (ADR-0026) shared by club app and website, emitting nodes, never HTML; the website renderer for subheadings, lists, bold, external links and mentions; the editor's conversion to and from the subset (rulings 10, 11) | built 2026-10-09 — **`@furria/ui/news-text`** (leaf subpath, pure): `readNewsText` → `NewsBlock[]` (paragraph · heading · list of `NewsInline` = text {bold, href} or mention {kind, numeric id, label, bold}), line-based like the server's `NewsText` (a `## ` line is a heading, `- ` lines a list, other adjacent lines one paragraph, blank lines split), anything outside the subset stays literal; `writeNewsText` is its inverse and writes only what the server accepts — escapes `\ * [ ] \`` and tag-opening `<`, structure openers at a paragraph's start (`# - > + 1.` rules, fences, setext), `!`/`@` right before a link, encodes `( )` in addresses, collapses layout whitespace, trims line edges, drops blank bold, empty blocks, blank mentions and invalid links (to their label); `newsPlainTextOf` for reading time and plain previews. **`KkNewsText`** renders the blocks as `p`/`h2`/`ul`/`strong` and external links (new tab, `↗`, visually hidden *öffnet in neuem Tab*); a mention renders through a `mentionView` slot, default its plain label — S6 passes the card view. Body paint shared with `KkProseField` (`internal/news-text-paint.ts`), so editor and article set identically. **Club app `lib/news-prose.ts`**: the ProseMirror schemas and `newsDocOf`/`newsTextOf` over the shared model (headings carry no marks, mention attrs `{kind, id: number, label}`, DOM key `group:12`); the lab runs on it (its private parser deleted, lab mention ids numeric). Website article renders `KkNewsText`; seeds carry subset `text` instead of `body[]`, `parseInlineBold` removed |
| S5 | **News workbench (club app)** | Built per the S3 verdict on S1, S2, S4: the Mehr entry and `/news` hub, the editor, picture upload / gallery pick / crop / caption, event and album ties, mentions, previews, publish / pending changes / discard / withdraw / republish / delete, the concurrent-save hint; lab prototype removed (rulings 3–16) | built 2026-10-10 — **backend gaps** (migration `NewsLastSaver`: `news_post.last_saved_by_person_id`, SET NULL): `GET news` rows describe the working version and carry `missing`, `picture`, `pendingSavedAt`, `withdrawnAt`; `PUT news/{id}` answers `savedInBetween {savedBy, savedAt}`; `GET news/{id}` carries `lastSavedBy` and tie card data (event venue/end/cancelled, album `photoCount` + cover); both publish endpoints answer 200 `{slug, publishedAt, revision}`; mentionables carry group tone/picture/description and portraits; stray-person absorption refuses a news author as club data and repoints the last saver. **Website surfaces in `@furria/ui`:** `KkNewsLead`, `KkNewsRow`, `KkNewsCard`, `KkNewsMedia` (website = thin call sites, previews = the real components at phone width). **Club app `features/news`** at `/news` + `/news/$postId` (`neu`), Mehr → Verwaltung entry *Aktuelles*, `news.manage` copy; lab and the name "Narrenpresse" removed. Built on the prototype with a 39-point detail audit: hub as `KkPanel` rows (register mark + one fact line, poster thumbs, compact session strip without label, sections like `/events`, tab bar, empty state); editor sets like the article (hyphenation, tinted mention chips, cut ticks without reflow, labelled picture toolbar with two-tap delete and crop cancel, caption placeholder, compact tie rows / *Anheften* chips, gallery pick grouped by album, picker with pictures/portraits); publish moment without wash, centred stamp signed once that lifts away, article and bar flip only after the climax, confetti in red/gold **always, even under reduced motion** (`alwaysPlays`, press stage only); one-row phone press bar with ⋯ menu, segmented *Änderungen | Live-Fassung* on desktop, readiness chips that focus the field; previews scaled on desktop, open full size in one sheet. Autosave serialized with bounded retry, flush on leave, publish/withdraw abort when the save failed, `KkScreen.sceneKey` keeps the editor mounted through `neu` → id, HTML paste reduced to the subset. **Known, not fixed:** two posts with the same title published in the same instant race on the slug's unique index (500); media uploader isn't repointed by absorption (predates L7b) |
| S6 | **Public API + website** | `GET /api/public/news` (published posts grouped by session) and `GET /api/public/news/{slug}` with resolved mentions (card data only while public), ties (event card, album strip only while published), picture URLs; `/news` with older sessions as sections, archive bits removed; article with rendered text, mention cards in place, event card, album strip, caption; landing teaser on real data; `og:image`; seeds deleted (rulings 6–10, 15) | open |

## Out of scope

- Scheduled publishing, backdating, a bin for deleted posts.
- Pictures inside the text, galleries in a post (tie an album instead), embeds.
- Notifications of any kind on publish; news inside the club app beyond the workbench.
- Search, tags, filtering by category, an archive route, comments, RSS, newsletter.
- Real-time collaborative editing.
