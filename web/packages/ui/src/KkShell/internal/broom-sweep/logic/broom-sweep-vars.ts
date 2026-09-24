export const SWEEP_VAR = {
  reveal: '--kk-bs-reveal',
  revealOpacity: '--kk-bs-reveal-opacity',
  markOpacity: '--kk-bs-mark-opacity',
  markTransform: '--kk-bs-mark-transform',
  textLeft: '--kk-bs-text-left',
  ghostClip: '--kk-bs-ghost-clip',
  ghostRoom: '--kk-bs-ghost-room',
  ghostOpacity: '--kk-bs-ghost-opacity',
  ghostGlyph: '--kk-bs-ghost-glyph',
  ghostGlyphOpacity: '--kk-bs-ghost-glyph-opacity',
  sweeper: '--kk-bs-sweeper',
  sweeperOpacity: '--kk-bs-sweeper-opacity',
  trailLeft: '--kk-bs-trail-left',
  trailWidth: '--kk-bs-trail-width',
  trailOpacity: '--kk-bs-trail-opacity',
  trailAngle: '--kk-bs-trail-angle',
  foldPop: '--kk-bs-fold-pop',
  foldBrandOpacity: '--kk-bs-fold-brand-opacity',
  foldInkOpacity: '--kk-bs-fold-ink-opacity',
  foldLeft: '--kk-bs-fold-left',
  foldRight: '--kk-bs-fold-right',
  foldBristle: '--kk-bs-fold-bristle',
} as const;

export const moteVar = (index: number): string => `--kk-bs-mote-${index}`;

export const moteOpacityVar = (index: number): string => `--kk-bs-mote-${index}-opacity`;

export const varOf = (name: string, fallback: string): string => `var(${name}, ${fallback})`;
