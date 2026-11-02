export type KkTimelineLaneSize = 'ruler' | 'thin' | 'lane' | 'wave';

export const LANE_HEIGHTS: Record<KkTimelineLaneSize, string> = {
  ruler: '1.75rem',
  thin: '2rem',
  lane: '2.75rem',
  wave: '4.25rem',
};

export const LANE_AHEAD = 'calc(50% + 0.75rem)';
