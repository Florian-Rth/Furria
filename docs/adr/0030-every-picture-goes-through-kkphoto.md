# Every picture goes through KkPhoto

Pictures were drawn five different ways (`KkImage`, `KkCoverPicture`, `KkEventPicture`,
`KkEventCover`, `KkPhotoPlaceholder` stitched together per screen), so the missing-picture
placeholder, the broken-picture state and the cancelled stamp differed from screen to screen.
Florian, 2026-10-13: use our picture component everywhere and forbid the default img tags.

## The decision

**Apps show a picture only through `KkPhoto` (`@furria/ui`). Inside `@furria/ui`, only `KkImage`
renders an `<img>`. A lint rule enforces both.**

- `KkPhoto` covers every case: own aspect (`aspectRatio`) or `fill` of a sized slot, `size="thumb"`,
  `fit` cover/contain (logos), `priority`, the striped placeholder when there is no picture (with
  `tone`/`tint`/`placeholderLabel`), the broken-picture state when a file fails to load, and the
  cancelled `stampLabel` (`stampScale`) or `dimmed` look.
- `KkImage`, `KkCoverPicture` and `KkPhotoPlaceholder` stay internal building blocks of
  `@furria/ui` and are not exported. `KkEventPicture` and `KkEventCover` are gone.
- Purpose-built picture kits with their own behaviour stay (`KkAvatar`, `KkFrame`, `KkImageViewer`,
  `KkBannerDesk`, `KkCropFrame`); they build on `KkImage`, never on a raw `<img>`.
- **Enforcement:** `web/biome-plugins/noRawImage.grit` fails on `<img>`, `<picture>`, `<source>`,
  `CardMedia`, `ImageListItem`, `component="img"`, `Avatar src` and CSS `url(…)` images in every
  app and package — except `KkImage.tsx` and `KkCropPreview.tsx`.

## Considered options

- **Guidelines only.** Rejected: that is how five ways to draw a picture came about.
