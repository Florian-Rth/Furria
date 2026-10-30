import type { CSSObject } from '@mui/material/styles';

export type KkStudioGLaneKind = 'ruler' | 'music' | 'parts' | 'steps' | 'videos' | 'movement';

export const PPS_VAR = '--kk-studio-g-pps';

export const laneVarOf = (kind: KkStudioGLaneKind): string => `--kk-studio-g-lane-${kind}`;

const heightsOf = (heights: Record<KkStudioGLaneKind, string>): CSSObject =>
  Object.fromEntries(
    Object.entries(heights).map(([kind, height]) => [`--kk-studio-g-lane-${kind}`, height]),
  );

export const LANE_HEIGHTS = heightsOf({
  ruler: '1.25rem',
  music: '2.625rem',
  parts: '1.375rem',
  steps: '2rem',
  videos: '1.625rem',
  movement: '1.5rem',
});

export const SHORT_LANE_HEIGHTS = heightsOf({
  ruler: '1.125rem',
  music: '2.125rem',
  parts: '1.25rem',
  steps: '1.75rem',
  videos: '1.375rem',
  movement: '1.25rem',
});

export const WIDE_LANE_HEIGHTS = heightsOf({
  ruler: '1.375rem',
  music: '3.75rem',
  parts: '1.625rem',
  steps: '2.5rem',
  videos: '2rem',
  movement: '1.875rem',
});

export const placeOf = (start: number, end: number): { left: string; width: string } => ({
  left: `calc(${start} * var(${PPS_VAR}) * 1px)`,
  width: `calc(${Math.max(0, end - start)} * var(${PPS_VAR}) * 1px)`,
});

export const pointOf = (seconds: number): { left: string } => ({
  left: `calc(${seconds} * var(${PPS_VAR}) * 1px)`,
});
