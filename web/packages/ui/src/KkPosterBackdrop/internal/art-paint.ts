import type { CSSObject, Theme } from '@mui/material/styles';
import { applyScheme } from '../../internal/scheme-paint';
import { TRACK_BLEED, TRACK_INSET } from '../../KkShell/internal/track-edge';
import type { ArtPlacement } from './logic/poster-composition';

const ART_STRENGTH = { light: 0.62, dark: 1 } as const;

const topOf = (placement: ArtPlacement): string =>
  placement.anchor === 'page' ? `${placement.y}vw` : `${placement.y}%`;

export const artFrame = (theme: Theme): CSSObject => ({
  position: 'absolute',
  ...TRACK_BLEED,
  zIndex: -1,
  pointerEvents: 'none',
  contain: 'paint',
  ...applyScheme(theme, {
    light: { opacity: ART_STRENGTH.light },
    dark: { opacity: ART_STRENGTH.dark },
  }),
  [theme.breakpoints.up('lg')]: { position: 'fixed', inset: 0, contain: 'none' },
});

export const artLand = (theme: Theme): CSSObject => ({
  position: 'absolute',
  ...TRACK_INSET,
  [theme.breakpoints.up('lg')]: { inset: 0 },
});

export const artPlacementPaintOf =
  (placement: ArtPlacement) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    left: `${placement.x}%`,
    top: topOf(placement),
    width:
      placement.view === 'phone'
        ? `${placement.width}vw`
        : `min(${placement.width}vw, ${placement.cap}rem)`,
    height: 'auto',
    opacity: placement.strength,
    transform: `translate(-50%, -50%) rotate(${placement.rotate}deg)`,
    display: placement.view === 'phone' ? 'block' : 'none',
    [theme.breakpoints.up('lg')]: { display: placement.view === 'phone' ? 'none' : 'block' },
  });
