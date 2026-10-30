import type { CountMark } from '@/features/act-player/music-timeline';
import type { StudioStep } from '@/features/acts/schemas';

const EDGE_TOLERANCE_SECONDS = 1e-3;
const FREE_MARGIN_SECONDS = 0.25;

export type StepEdge = 'start' | 'end';
export type PageDirection = 'back' | 'forward';

export interface StepSpan {
  stepId: number;
  start: number;
  end: number;
}

export const spansOf = (steps: readonly StudioStep[]): StepSpan[] =>
  steps
    .flatMap((step) =>
      step.placement === 'onTimeline' && step.startSeconds !== null && step.endSeconds !== null
        ? [{ stepId: step.stepId, start: step.startSeconds, end: step.endSeconds }]
        : [],
    )
    .sort((left, right) => left.start - right.start);

export const neighbourIdOf = (
  spans: readonly StepSpan[],
  stepId: number,
  direction: PageDirection,
): number | null => {
  const index = spans.findIndex((span) => span.stepId === stepId);

  if (index < 0) {
    return null;
  }

  return spans[direction === 'forward' ? index + 1 : index - 1]?.stepId ?? null;
};

export const isMovableEdge = (
  spans: readonly StepSpan[],
  stepId: number,
  edge: StepEdge,
): boolean => {
  const index = spans.findIndex((span) => span.stepId === stepId);

  if (index < 0) {
    return false;
  }

  return edge === 'start' ? index > 0 : index < spans.length - 1;
};

const nearestOf = (candidates: readonly number[], seconds: number): number | null =>
  candidates.reduce<number | null>(
    (best, candidate) =>
      best === null || Math.abs(candidate - seconds) < Math.abs(best - seconds) ? candidate : best,
    null,
  );

const borderAt = (
  lower: number,
  upper: number,
  seconds: number,
  marks: readonly CountMark[],
): number | null => {
  if (marks.length === 0) {
    const low = lower + FREE_MARGIN_SECONDS;
    const high = upper - FREE_MARGIN_SECONDS;

    return low > high ? null : Math.min(high, Math.max(low, seconds));
  }

  const candidates = marks
    .map((mark) => mark.seconds)
    .filter(
      (candidate) =>
        candidate > lower + EDGE_TOLERANCE_SECONDS && candidate < upper - EDGE_TOLERANCE_SECONDS,
    );

  return nearestOf(candidates, seconds);
};

export const movedBorderOf = (
  spans: readonly StepSpan[],
  stepId: number,
  edge: StepEdge,
  seconds: number,
  marks: readonly CountMark[],
): StepSpan[] => {
  const index = spans.findIndex((span) => span.stepId === stepId);
  const border = edge === 'start' ? index : index + 1;
  const before = spans[border - 1];
  const after = spans[border];

  if (index < 0 || before === undefined || after === undefined) {
    return [...spans];
  }

  const placed = borderAt(before.start, after.end, seconds, marks);

  if (placed === null) {
    return [...spans];
  }

  return spans.map((span, position) => {
    if (position === border - 1) {
      return { ...span, end: placed };
    }
    if (position === border) {
      return { ...span, start: placed };
    }
    return span;
  });
};

export const countsIn = (marks: readonly CountMark[], span: StepSpan): number =>
  marks.filter(
    (mark) =>
      mark.seconds >= span.start - EDGE_TOLERANCE_SECONDS &&
      mark.seconds < span.end - EDGE_TOLERANCE_SECONDS,
  ).length;

export const countAtOrAfter = (marks: readonly CountMark[], seconds: number): number | null =>
  marks.find((mark) => mark.seconds >= seconds - EDGE_TOLERANCE_SECONDS)?.count ?? null;

export const countBefore = (marks: readonly CountMark[], seconds: number): number | null =>
  marks.findLast((mark) => mark.seconds < seconds - EDGE_TOLERANCE_SECONDS)?.count ?? null;

export const spanAt = (spans: readonly StepSpan[], seconds: number): StepSpan | null =>
  spans.find((span) => seconds >= span.start && seconds < span.end) ??
  spans.find((span) => span.start > seconds) ??
  spans.at(-1) ??
  null;

export interface BeatPlace {
  eight: number;
  count: number;
}

const COUNTS_PER_EIGHT = 8;
const DENSE_ALL = 40;
const DENSE_HALVES = 16;

export type CountNumbers = 'all' | 'halves' | 'downbeats';

export const beatPlaceOf = (
  marks: readonly CountMark[],
  span: StepSpan,
  seconds: number,
  edge: StepEdge,
): BeatPlace | null => {
  const inside = marks.filter(
    (mark) =>
      mark.seconds >= span.start - EDGE_TOLERANCE_SECONDS &&
      mark.seconds < span.end - EDGE_TOLERANCE_SECONDS,
  );
  const index =
    edge === 'start'
      ? inside.findIndex((mark) => mark.seconds >= seconds - EDGE_TOLERANCE_SECONDS)
      : inside.findLastIndex((mark) => mark.seconds < seconds - EDGE_TOLERANCE_SECONDS);
  const mark = inside[index];

  return mark === undefined
    ? null
    : { eight: Math.floor(index / COUNTS_PER_EIGHT) + 1, count: mark.count };
};

export const countNumbersOf = (counts: number, wide: boolean): CountNumbers => {
  if (wide) {
    return counts > DENSE_ALL ? 'halves' : 'all';
  }

  return counts > DENSE_HALVES ? 'downbeats' : 'halves';
};
