export const WAVE_VIEW_HEIGHT = 100;
const BAR_SHARE = 0.62;
const QUIET_FLOOR = 0.04;

export const wavePathOf = (values: readonly number[]): string =>
  values
    .map((value, index) => {
      const half = (Math.max(QUIET_FLOOR, value) * WAVE_VIEW_HEIGHT) / 2;
      const top = WAVE_VIEW_HEIGHT / 2 - half;

      return `M${index} ${top}h${BAR_SHARE}v${half * 2}h${-BAR_SHARE}z`;
    })
    .join('');
