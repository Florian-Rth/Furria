import type { CSSObject, Theme } from '@mui/material/styles';
import { TRACK_SIDE_BLEED } from '../../KkShell/internal/track-edge';
import type { FootPlacement } from './logic/poster-foot';

const FOOT_HEIGHT = '12.5rem';
const FOOT_FADE = '38%';

export const footPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  ...TRACK_SIDE_BLEED,
  height: FOOT_HEIGHT,
  pointerEvents: 'none',
  backgroundImage: `linear-gradient(to bottom, transparent, ${(theme.vars ?? theme).palette.background.default} ${FOOT_FADE})`,
  [theme.breakpoints.up('lg')]: { display: 'none' },
});

export const footPlacementPaintOf = (placement: FootPlacement): CSSObject => ({
  position: 'absolute',
  left: `${placement.x}%`,
  top: `${placement.y}%`,
  width: `min(${placement.width}%, ${placement.cap}rem)`,
  height: 'auto',
  opacity: placement.strength,
  transform: `translate(-50%, -50%) rotate(${placement.rotate}deg)`,
});
