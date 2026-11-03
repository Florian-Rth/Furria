import { percentOf } from '../../internal/score-paint';

export type KkTimelineRowKind = 'ruler' | 'parts' | 'steps' | 'videos' | 'keys';

export type KkTimelineRows = Readonly<Record<KkTimelineRowKind, boolean>>;

type RowScale = 'compact' | 'regular';

export const TIMELINE_DENSITIES = {
  strip: { height: '3.25rem', scale: 'compact' },
  track: { height: '10rem', scale: 'regular' },
  full: { height: '12.5rem', scale: 'regular' },
  edit: { height: 'auto', scale: 'regular' },
  desk: { height: '17.5rem', scale: 'regular' },
  film: { height: '11.25rem', scale: 'regular' },
  overview: { height: '3.5rem', scale: 'compact' },
} as const satisfies Record<string, { height: string; scale: RowScale }>;

export type KkTimelineDensity = keyof typeof TIMELINE_DENSITIES;

const ROW_SIZES: Record<RowScale, Record<KkTimelineRowKind, string>> = {
  compact: { ruler: '1rem', parts: '1.125rem', steps: '0.625rem', videos: '1.25rem', keys: '1rem' },
  regular: {
    ruler: '1.375rem',
    parts: '1.5rem',
    steps: '2.75rem',
    videos: '2.5rem',
    keys: '2.25rem',
  },
};

export const NO_ROWS: KkTimelineRows = {
  ruler: false,
  parts: false,
  steps: false,
  videos: false,
  keys: false,
};

export const LANE_VARS = {
  ruler: '--kk-timeline-ruler',
  parts: '--kk-timeline-parts',
  steps: '--kk-timeline-steps',
  videos: '--kk-timeline-videos',
  keys: '--kk-timeline-keys',
} as const satisfies Record<KkTimelineRowKind, string>;

const ROW_KINDS: readonly KkTimelineRowKind[] = ['ruler', 'parts', 'steps', 'videos', 'keys'];

export const rowVarsOf = (
  density: KkTimelineDensity,
  rows: KkTimelineRows,
): Record<string, string> => {
  const sizes = ROW_SIZES[TIMELINE_DENSITIES[density].scale];

  return Object.fromEntries(
    ROW_KINDS.map((kind) => [LANE_VARS[kind], rows[kind] ? sizes[kind] : '0rem']),
  );
};

export const EMPTY_ROW_VARS: Record<string, string> = Object.fromEntries(
  ROW_KINDS.map((kind) => [LANE_VARS[kind], '0rem']),
);

const below = (...kinds: readonly KkTimelineRowKind[]): string =>
  `calc(${kinds.map((kind) => `var(${LANE_VARS[kind]})`).join(' + ')})`;

export const waveTop = below('ruler', 'parts');
export const waveBottom = below('steps', 'videos', 'keys');
export const stepsTop = `calc(100% - ${waveBottom})`;
export const stepsBottom = below('videos', 'keys');
export const videosTop = `calc(100% - ${stepsBottom})`;
export const keysTop = `calc(100% - var(${LANE_VARS.keys}))`;

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
