---
title: Image Toolkit — stage engine, shared viewer, picture helpers
slug: image-toolkit
type: cross-cutting
status: built
scope: web/packages/ui, web/apps/club-app, web/apps/website
rfc: https://github.com/Florian-Rth/Furria/issues/34
base: refactor/deep-modules (PR #33)
depends-on: []
adrs: []
---

# Image Toolkit

The plan builds one generic set of image tools in `@furria/ui`, used by both the club app and the
website:
- a pure **stage engine** for pan, zoom, pinch, swipe and pull;
- the **viewer** built on it, which replaces club-app `KkLoupe` and website `PhotoViewer`;
- `KkCropFrame` running on the same engine;
- shared **picture helpers** for aspect ratios, srcset and centred crop.

Shaped on 2026-10-11 from four competing designs: minimal, flexible, common-caller and
pure-core. The chosen hybrid takes the pure-core engine, the minimal public surface, and the
common-caller typed items and aspect names.

Read first: `CONTEXT.md` → **Portrait**, **Group picture**, **Media item**, **Album**;
`plan/launch/l7a-media-store.md` (crop frame, renditions); `docs/web/TESTING.md`.

## Problem

Image handling is spread across shallow, duplicated modules with no shared engine:

- **Two unrelated photo viewers.**
  - Club-app `KkLoupe` uses raw pointer events. It is an inline fixed `Stack` with no portal, focus trap, scroll lock or focus restore, and the drag offset does not animate back.
  - Website `PhotoViewer` is a MUI fullscreen `Dialog` with motion `drag="x"`.
  - Neither has zoom (pinch, wheel, double-tap), axis locking, a neighbour peek that follows the finger, velocity flicks or neighbour preloading.
  - Thresholds differ: 18% of the width vs 56px. The club-app viewer uses a single `src` with no srcset; the website lazy-loads inside the viewer.
- **Gesture code is copied three times.**
  - `use-loupe-gestures` and `use-light-table-gestures` are near-copies (0.18/120 vs 0.2/90).
  - `use-crop-frame` re-implements pan, pinch, wheel and keys on its own.
  - None of this behaviour is tested, because the repo forbids hook and DOM tests.
- **Crop and viewer are the same problem with a different fit.** The crop frame fills its frame (`cover`); the viewer fits the whole image (`contain`). Today they share nothing.
- **Picture data is duplicated.**
  - Aspect ratios (portrait 4/5, group 3/2, banner 2/1) are defined in about six places, plus the strings in `tokens.aspectRatio`.
  - `toPictureSources` is copied in both apps.
  - Centred-crop maths exists twice in TS (`centredBannerCropOf`, `crop-frame`).
  - `KkAvatar` has no srcset, and most avatars pass a raw `smallUrl`.

The risk is in the seams. Every gesture surface decides on its own about axes, edges and release thresholds, so behaviour drifts and bugs are fixed in one place but not the others.

## Proposed Interface

The design combines a pure gesture engine (functional core), a small public kit, and shared picture helpers. Everything lives in `@furria/ui` and is used by both club-app and website.

### 1. Picture helpers (public, pure)
```ts
export const KK_ASPECT = { portrait: 4/5, groupPicture: 3/2, banner: 2, landscape: 7/5 } as const;
export type KkAspect = keyof typeof KK_ASPECT | number;
export const aspectOf: (aspect: KkAspect) => number;
export const aspectRatioCss: (aspect: KkAspect) => string;        // tokens.aspectRatio derives from this
export interface KkPictureUrls { smallUrl: string; mediumUrl: string; largeUrl: string }
export interface KkImageSource { src: string; srcSet?: string; sizes?: string }
export const toImageSource: (urls: KkPictureUrls | null, aspect: KkAspect, sizes?: string) => KkImageSource | null;
export const centredCrop: (image: KkSize | null, aspect: KkAspect) => KkCrop;   // KkCrop (0..1 fractions) unchanged
```
`KkAvatar`, `KkPhoto` and `KkCoverPicture` take `image?: KkImageSource`.

### 2. Stage engine (internal to `@furria/ui`, pure, exhaustively tested)
```ts
interface StagePolicy { fit: 'contain' | 'cover'; maxZoom: number; doubleTapZoom: number;
  swipe: boolean; pull: boolean; hasPrevious: boolean; hasNext: boolean; reducedMotion: boolean }
type StageInput =
  | { type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel'; id; x; y; t; shown?: Transform }
  | { type: 'wheel'; dx; dy; x; y; pinch: boolean; t } | { type: 'pinchGesture'; scale; x; y; t }
  | { type: 'zoomKey'; direction: 1 | -1 | 0 } | { type: 'panKey'; dx; dy } | { type: 'zoomTo'; zoom }
  | { type: 'measure'; stage: Size; image: Size | null } | { type: 'reset'; transform?: Transform };
type StageIntent = { kind: 'step'; delta: 1 | -1 } | { kind: 'pull' } | { kind: 'tap' }
  | { kind: 'zoomed'; zoomed: boolean } | { kind: 'transformed'; transform: Transform };
interface StageView { image: Transform; track: number; pull: number;
  motion: 'follow' | 'settle' | 'slide' | 'instant'; phase: 'idle' | 'pending' | 'pan' | 'swipe' | 'pull' | 'pinch' }
initialStage(policy) / stepStage(state, input, policy) => { state, intents } / viewOf(state) => StageView
// geometry: clampTransform, rubberBand, zoomAbout(focal), edgesOf, cropOf, transformOfCrop
```
A single DOM adapter, `useImageStage`, handles pointer capture, wheel, Safari `gesture*` events and resize measuring. It writes `viewOf` into motion `MotionValue`s, so pointer moves cause no React re-renders, and runs settle and slide with `animate()`.

### 3. Viewer kit + preset (public)
```ts
export interface KkViewerItem {
  key: string; alt: string;
  image: KkImageSource | null;          // null = developing (Latent)
  size?: KkSize; caption?: string;
  video?: { src: string; duration: string };
}
export const KkViewer = Object.assign(KkViewerRoot, { Bar, Stage, Caption, Counter, StepButton, Filmstrip, Close, Latent, Film });
// Root: { items, index: number | null, onIndexChange, onClose, labels, keys?: Record<string, () => void> }
export const KkImageViewer: FC<{ items; index; onIndexChange; onClose; labels; title?; footer?: ReactNode }>; // preset in its own file
export const KkCropFrame: FC<{ source; alt; aspect: KkAspect; guide?: 'circle' | 'none'; initialCrop?;
  onCropChange; labels; onUnreadable?; sx? }>;                    // props kept; internals = engine with fit 'cover'
```

### Usage
```tsx
// website: one line. ?photo=<1-based index> stays in use-photo-viewer
<KkImageViewer items={items} index={viewer.index} onIndexChange={viewer.open} onClose={viewer.close}
  labels={photoViewerLabels} title={album.title} footer={<AlbumMeta album={album} />} />

// club-app: kit. ?photo=<mediaItemId> stays in use-album-loupe and is mapped to an index
<KkViewer items={items} index={loupe.index} onIndexChange={loupe.show} onClose={onClose} labels={LOUPE_LABELS}
  keys={{ PageDown: loupe.nextScene, PageUp: loupe.previousScene, d: loupe.download }}>
  <KkViewer.Bar><KkViewer.Close /><KkFilmEdge … /><DownloadButton /></KkViewer.Bar>
  <KkViewer.Stage />
  <LoupeFacts … /><KkViewer.Caption /><KkViewer.Filmstrip reach={12} onSceneStep={loupe.sceneStep} />
</KkViewer>

// portrait crop
<KkCropFrame source={src} alt={alt} aspect="portrait" guide="circle" initialCrop={crop} onCropChange={desk.changeCrop} labels={labels} />

// news banner
const initial = centredCrop(photo.size, 'banner');
```

### What it hides
- **Axis lock.** After an 8px slop, a gesture is classified once and stays that way until release:
  - not zoomed: a horizontal drag becomes `swipe`; a downward drag becomes `pull` (close); an upward drag is ignored;
  - zoomed: the drag becomes `pan`.
- **Edge handover.** A zoomed pan that is pinned at a horizontal edge hands its extra distance over to the swipe track, so the neighbour peeks in.
- **Bounds.**
  - Overshoot gets a rubber-band while the finger is down and settles to the clamped position on release.
  - `contain` centres any axis smaller than the stage; `cover` never shows empty space.
- **Pinch.** A second pointer always switches to pinch, zooming around the midpoint. When one finger lifts, the gesture continues as a pan without a jump.
- **Zoom inputs.**
  - Double-tap or double-click toggles `doubleTapZoom` around the tap point.
  - ctrl+wheel and Safari trackpad pinch zoom; `+`, `-` and `0` zoom; the crop slider zooms.
  - All of these keep the focal point fixed.
- **Swipe commit.**
  - A swipe commits by distance (0.2 of the width) or by velocity from the last ~80ms.
  - The neighbour track (prev/current/next) follows the finger.
  - Catching an image mid-animation continues from what is on screen (`shown`), so it does not jump.
- **Switch feel — the website viewer is the reference.** Florian likes today's website viewer and the
  kit keeps its two signatures (`PhotoViewerPhoto`: `dragElastic: 0.16`, `FADE_TRANSITION` 0.22s
  `easeOut`, opacity 0 → 1):
  - **No slide into nothing.** Toward a missing neighbour (first/last photo) the drag stays tight:
    the website's 0.16 elastic, no neighbour track and no empty stage revealed, and it snaps back
    on release with no intent. Same at a zoomed edge without a neighbour: no handover.
  - **Calm switch.** A step without a finger (button, arrow key, filmstrip) does not slide: the new
    photo fades in on place with the website's 0.22s `easeOut`. A finger swipe finishes its slide
    (the neighbour was already following the finger) and the incoming photo stays fully opaque — no
    arrival fade, which read as a flash (Florian, 2026-10-11).
  - These values become engine/viewer constants. The S3 browser check films the website before and
    after and compares the switch frame by frame.
- **Reduced motion.** Slide, fade and settle become instant, and there is no pull scaling.
- **Viewer.**
  - Modal a11y through MUI `Modal`: portal, focus trap, scroll lock, focus restore, dark scheme.
  - Zoom resets when the index changes.
  - Neighbours are preloaded with srcset/sizes and `decode()`.
  - Built-in keys (←/→, +/−/0, Esc) merge with the app's `keys`; key repeats and keys pressed on controls are ignored.
- **Crop.** `cropOf` and `transformOfCrop` convert between `KkCrop` fractions and the transform, and the slider position is `zoomOf`.

## Dependency Strategy

- **In-process.** The engine and geometry are pure; there is no I/O.
- **No gesture library.** `@use-gesture/react` would keep the classification decisions in hook state, where the repo's pure-only test rule can't reach them. The DOM adapter is small and hand-rolled.
- **`motion`** (already a dependency) is used only for MotionValues and `animate()`.
- **Stays in the apps:** URL state, the Zod `PictureSchema` (the website transforms URLs, and `@furria/ui` has no zod), uploads, `picture-desk`, requests, scene logic and download.
- **No backend change.** The `KkCrop` rectangle contract is unchanged.

## Testing Strategy

**New boundary tests to write** (vitest, `it.each`, literal fixtures; the output of `viewOf` and the intents are the only assertions):
- `stage-machine`: input sequences in, view and intents out. Cases:
  - slop classification;
  - axis lock holding through diagonal drift;
  - swipe blocked while zoomed and not at an edge;
  - edge handover;
  - swipe commit by distance and by velocity;
  - no step at the ends;
  - pull → close, and an upward drag ignored;
  - pinch around the midpoint, then pinch → lift → pan;
  - double-tap zooming in and out;
  - wheel, pinch-wheel and keys;
  - cover never showing empty space;
  - instant motion under reduced motion.
- `stage-geometry`: clamping under contain and cover, rubber-band monotonic and bounded, `zoomAbout` keeping the focal point fixed, the `cropOf` ↔ `transformOfCrop` round trip, `centredCrop`.
- `viewer-steps` (preload plan, neighbours at the ends), `image-source`, `image-aspect`.

**Old tests to delete or fold in:**
- `crop-frame.test.ts` folds into `stage-geometry`; its cover vectors stay as regression cases against crop drift.
- `picture-sources.test.ts` moves into `image-source`.
- The `centredBannerCropOf` cases in club-app `news-picture.test.ts` move to `centredCrop`.
- The swipe, arrow and clamp cases in website `photo-viewer-steps.test.ts` go.
- The light table's swipe and pull thresholds were never tested; the engine now covers them.

**Test environment:** plain node vitest; no stand-ins needed.

## Implementation Recommendations

- **The engine owns** every pointer, wheel, key and slider decision for an image surface: axis, phase, bounds, zoom, release outcome and animation kind. It exposes only `policy + input → view + intents`. Surfaces differ by policy alone:
  - viewer = `contain`, `swipe`, `pull`;
  - crop = `cover`, no swipe or pull;
  - light table = `maxZoom: 1`, `swipe`, and `pull` meaning reject.
- **It hides** the pointer map, slop, velocity sampling, rubber-band curve, transform maths and MotionValue plumbing. The thresholds are engine constants, not props.
- **The viewer exposes** a typed item list, an index and intents. URL state, domain types and copy stay in the apps; each app keeps a small pure `toViewerItem` mapper.
- **Picture helpers are the single source** for aspect ratios and srcset. The app-local constants and `toPictureSources` copies are deleted.
- **Migration order:** each step is shippable and verified before the next.
  1. Picture helpers and the aspect ratio in tokens. No behaviour change.
  2. Engine plus `KkCropFrame` on it. The existing crop vectors must still pass. Portrait, group and banner crops are checked in the browser.
  3. Website viewer → `KkImageViewer`. Delete `PhotoViewerDialog`, `PhotoViewerPhoto` and the swipe/arrow step helpers.
  4. Club-app viewer → `KkViewer` kit. Delete `use-loupe-gestures` and the old `KkLoupe` shell.
  5. Light table on the engine. Delete `use-light-table-gestures`.
  6. `KkAvatar` and `KkPhoto` callers move to `image` sources.
- **Out of scope:** rotation and a focal point. The backend stores only a crop rectangle. `KkFrame.focal` can later be derived from the crop centre.

## Slices

Each slice is shippable on its own and verified before the next starts. Validation follows
CLAUDE.md: lint, typecheck of the touched packages and the affected test files. A browser check
(Playwright, filmed) is required for every slice that changes how a surface behaves.

### S1 — Picture helpers (no behaviour change)
- `KK_ASPECT`, `aspectOf`, `aspectRatioCss`, `toImageSource`, `centredCrop`, `KkSize`, exported from `@furria/ui`.
- `tokens.aspectRatio` is derived from `KK_ASPECT`.
- Delete:
  - both apps' `toPictureSources` and their aspect constants;
  - club-app and website `BANNER_ASPECT` and `centredBannerCropOf`;
  - the hard-coded aspect ratios in the mention-card portraits.
- `KkAvatar`, `KkPhoto` and `KkCoverPicture` take `image?: KkImageSource`; all callers migrate,
  including the avatars that pass a raw `smallUrl`.
- Tests: `image-source`, `image-aspect`, `centredCrop`. `picture-sources.test.ts` and the
  `centredBannerCropOf` cases are absorbed.

### S2 — Stage engine + KkCropFrame
- `stage-geometry`: `clampTransform`, `rubberBand`, `zoomAbout`, `edgesOf`, `cropOf`,
  `transformOfCrop`, `zoomOf`.
- `stage-machine`: `initialStage`, `stepStage`, `viewOf`. Internal to `@furria/ui`.
- `useImageStage` is the only DOM adapter:
  - pointer capture, wheel, Safari `gesture*` events, a ResizeObserver for `measure`;
  - writes MotionValues;
  - runs `animate()` for settle and slide.
- `KkCropFrame` rebuilt on it with `fit: 'cover'`, no swipe and no pull. Its props stay the same.
  Delete `use-crop-frame.ts` and `crop-frame.ts`; `KkCropView` goes.
- Tests: `stage-geometry` (the `crop-frame.test.ts` vectors kept as regression cases) and
  `stage-machine` (the full sequence matrix from the RFC).
- Browser check:
  - portrait crop with the circle guide, group-picture crop, news banner crop;
  - recrop shows the stored crop again unchanged (no drift);
  - pinch, wheel, keys and slider.

### S3 — Viewer kit + website
- `KkViewer` kit: Root (MUI `Modal`, dark scheme, keymap), Bar, Stage (prev/current/next track),
  Caption, Counter, StepButton, Filmstrip, Close, Latent, Film.
- `KkImageViewer` preset, in its own file.
- `viewer-steps`: neighbours and the preload plan. `usePreloadImages` uses srcset, sizes and
  `decode()`.
- Website `PhotoViewer` becomes `KkImageViewer` plus a pure `toViewerItem`. `?photo=` stays a
  1-based index in `use-photo-viewer`.
- Delete `PhotoViewerDialog`, `PhotoViewerPhoto`, `PhotoViewerStage`, `use-shown-photo-index` and
  the swipe, arrow and clamp step helpers.
- Browser check at phone and desktop width, light and dark:
  - swipe with neighbour peek, axis lock, pull-to-close;
  - pinch and double-tap zoom, pan clamped with rubber-band, edge handover;
  - buttons disabled at the ends, keys, reduced motion;
  - the switch feel (see "Switch feel"): first/last photo cannot be dragged toward the missing side
    beyond the tight 0.16 elastic, and a button/key step fades like today's website viewer — filmed
    against the pre-S3 website viewer.

### S4 — Club-app viewer
- `AlbumLoupe` composes the `KkViewer` kit: `Bar` holds `KkFilmEdge` and download; facts and caption;
  `Filmstrip` with a reach of 12 and scene steps.
- `keys`: `PageUp`/`PageDown` step scenes, `d` downloads.
- `use-album-loupe` maps frames to `KkViewerItem`. Video items get `video`; developing items get
  `image: null`.
- `?photo=mediaItemId` stays.
- On close it still scrolls to the frame and makes it glow. The clip-path open animation stays the
  Root's entry, and `tokens.gallery.loupe.closeSeconds` now gets used for the exit.
- Delete `use-loupe-gestures.ts` and the old `KkLoupe` shell.
- The club-app loupe gets the same switch feel as the website (it replaces the loupe's own
  18%-width swipe and un-animated drag).
- Browser check: the S3 matrix, plus video playback without the drag hijacking its controls,
  developing items, scene steps and the filmstrip.

### S5 — Light table on the engine
- `KkLightTable` uses `useImageStage` with `maxZoom: 1`, `swipe: true` and `pull` meaning reject.
  Its own keymap and departure animations stay.
- Delete `use-light-table-gestures.ts`.
- Browser check: swipe through the inbox, pull to reject, then undo.

## Out of scope

- **Rotation and focal point.** The backend stores only a crop rectangle. `KkFrame.focal` can later be
  derived from the crop centre. Confirm with a grep that nothing passes it before removing it.
- **Blurhash or placeholder colour.** The backend produces none.
- **The other pointer surfaces:** showcase drag, selection stroke and letter rail.
