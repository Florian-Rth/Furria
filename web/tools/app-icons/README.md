# @furria/app-icons

Draws the FURRIA crossed-brooms app mark and renders every launcher icon and splash screen
the native Club-App shell needs.

```bash
pnpm icons        # from web/
```

Two steps run back to back:

1. `src/generate.ts` rasterises the mark from `src/brand-mark.ts` into
   `apps/club-app/assets/` — `icon-only.png`, `icon-background.png`, `icon-foreground.png`,
   `splash.png` and `splash-dark.png`.
2. `capacitor-assets` fans those sources out into `apps/club-app/android/app/src/main/res/`.

Both the sources and the generated Android resources are committed, so a plain checkout builds
the app without running this tool. Run it after changing `brand-mark.ts`.

`brand-mark.ts` is the only place the mark exists. The geometry follows the app-icon tile in
`docs/design/fcc-logos.jsx`; the tile gradient uses the shipped `@furria/ui` red tokens rather
than the mock's own red, so the icon matches the app it opens.

`icon-foreground.png` is scaled to sit inside the Android adaptive-icon safe zone —
`capacitor-assets` insets it by a further 16.7%, so the mark must not fill its own canvas.
