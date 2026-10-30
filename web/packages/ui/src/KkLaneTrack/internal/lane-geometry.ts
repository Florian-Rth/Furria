export const LANE_HEAD_REM = 6.5;
export const LANE_HEAD = `${LANE_HEAD_REM}rem`;
export const LANE_WIDTH_VAR = '--kk-lane-width';
export const LANE_HEAD_VAR = '--kk-lane-head';
export const PERCENT = 100;

export type KkLaneTrackRowSize = 'ruler' | 'thin' | 'lane' | 'wave';

export const ROW_HEIGHTS: Record<KkLaneTrackRowSize, string> = {
  ruler: '1.75rem',
  thin: '2rem',
  lane: '2.75rem',
  wave: '4.25rem',
};

export const LANE_PAD = `calc((100cqw - var(${LANE_HEAD_VAR})) / 2)`;

export const percentOf = (share: number): string => `${share * PERCENT}%`;

export const contentLeftOf = (share: number): string =>
  `calc(var(${LANE_HEAD_VAR}) + (100cqw - var(${LANE_HEAD_VAR})) / 2 + ${share} * var(${LANE_WIDTH_VAR}))`;
