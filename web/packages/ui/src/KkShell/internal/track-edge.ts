import type { CSSObject } from '@mui/material/styles';

export const TRACK_EDGE = {
  top: '--kk-shell-track-top',
  right: '--kk-shell-track-right',
  bottom: '--kk-shell-track-bottom',
  left: '--kk-shell-track-left',
} as const;

type TrackSide = keyof typeof TRACK_EDGE;

export const trackEdgeOf = (side: TrackSide): string => `var(${TRACK_EDGE[side]}, 0px)`;

const bleedOf = (side: TrackSide): string => `calc(-1 * ${trackEdgeOf(side)})`;

export const TRACK_BLEED: CSSObject = {
  top: bleedOf('top'),
  right: bleedOf('right'),
  bottom: bleedOf('bottom'),
  left: bleedOf('left'),
};

export const TRACK_INSET: CSSObject = {
  top: trackEdgeOf('top'),
  right: trackEdgeOf('right'),
  bottom: trackEdgeOf('bottom'),
  left: trackEdgeOf('left'),
};

export const TRACK_SIDE_BLEED: CSSObject = {
  marginLeft: bleedOf('left'),
  marginRight: bleedOf('right'),
};
