import { percentOf } from '../../internal/score-paint';

export const TIMELINE_LANES = {
  strip: { height: '3.25rem', ruler: '0rem', parts: '1.125rem', steps: '0.625rem' },
  track: { height: '10rem', ruler: '1.25rem', parts: '1.375rem', steps: '2.5rem' },
  full: { height: '12.5rem', ruler: '1.375rem', parts: '1.625rem', steps: '3.25rem' },
  edit: { height: '100%', ruler: '0rem', parts: '2.5rem', steps: '1.25rem' },
  desk: { height: '16.25rem', ruler: '0rem', parts: '0rem', steps: '0rem' },
  film: { height: '11.25rem', ruler: '0rem', parts: '0rem', steps: '0rem' },
  overview: { height: '3.5rem', ruler: '0rem', parts: '1.125rem', steps: '0rem' },
} as const;

export type KkTimelineDensity = keyof typeof TIMELINE_LANES;

export const LANE_VARS = {
  ruler: '--kk-timeline-ruler',
  parts: '--kk-timeline-parts',
  steps: '--kk-timeline-steps',
} as const;

export const waveTop = `calc(var(${LANE_VARS.ruler}) + var(${LANE_VARS.parts}))`;
export const stepsTop = `calc(100% - var(${LANE_VARS.steps}))`;

export const WAVE_HEIGHT = 100;
const WAVE_MID = WAVE_HEIGHT / 2;
const BAR_FILL = 0.72;
const BAR_FLOOR = 0.6;

export const wavePathOf = (bars: readonly number[]): string =>
  bars
    .map((value, index) => {
      const half = Math.max(BAR_FLOOR, value * (WAVE_MID - 2));
      const left = index + (1 - BAR_FILL) / 2;

      return `M${left.toFixed(2)} ${(WAVE_MID - half).toFixed(2)}h${BAR_FILL}v${(half * 2).toFixed(2)}h-${BAR_FILL}z`;
    })
    .join('');

export interface KkTimelineSpan {
  from: number;
  to: number;
}

const WHOLE_SPAN: KkTimelineSpan = { from: 0, to: 1 };

export const spanPlaceOf = (
  span: KkTimelineSpan = WHOLE_SPAN,
): { left: string; width: string } => ({
  left: percentOf(span.from),
  width: percentOf(span.to - span.from),
});
