export const COLUMN_VAR = '--raster-evening';

export const RASTER_HEIGHT =
  'calc(100dvh - var(--kk-shell-track-top, 0px) - var(--kk-shell-track-bottom, 0px))';

export const RASTER_COLUMNS = {
  xs: 'minmax(0, 13fr) minmax(0, 11fr)',
  md: '17rem minmax(0, 1fr)',
} as const;

export const EVENING_WIDTH = { xs: '100%', md: '9.75rem' } as const;

export const HEAD_HEIGHT = { xs: '7.25rem', md: '7rem' } as const;

export const ROW_HEIGHT = { xs: '6.25rem', md: '4.5rem' } as const;

export const GROUP_HEIGHT = '2.75rem';

export const eveningGridOf = (count: number): string =>
  `repeat(${Math.max(count, 1)}, var(${COLUMN_VAR}))`;
