import type { CountMark } from '@/features/act-player/music-timeline';

const MIN_PIXELS_PER_SECOND = 3;
const MAX_PIXELS_PER_SECOND = 240;
const WHEEL_ZOOM_RATE = 0.0025;
const MIN_LABEL_GAP_PX = 30;
const MIN_COUNT_GAP_PX = 5;
const LABEL_STRIDES: readonly number[] = [1, 2, 4, 8, 16, 32];
const HALF_EIGHT_COUNT = 5;
const DOWNBEAT = 1;
const READING_TOLERANCE_SECONDS = 0.002;

export const DEFAULT_PIXELS_PER_SECOND = 14;

export type RulerTickWeight = 'eight' | 'half' | 'count';

export interface RulerTick {
  seconds: number;
  weight: RulerTickWeight;
}

export interface RulerLabel {
  seconds: number;
  eight: number;
}

export interface Ruler {
  ticks: RulerTick[];
  labels: RulerLabel[];
}

export const clampedZoomOf = (pixelsPerSecond: number): number =>
  Math.min(MAX_PIXELS_PER_SECOND, Math.max(MIN_PIXELS_PER_SECOND, pixelsPerSecond));

export const wheelZoomOf = (pixelsPerSecond: number, deltaY: number): number =>
  clampedZoomOf(pixelsPerSecond * Math.exp(-deltaY * WHEEL_ZOOM_RATE));

export const scrubbedSecondsOf = (
  startSeconds: number,
  deltaPx: number,
  pixelsPerSecond: number,
  length: number,
): number => Math.min(length, Math.max(0, startSeconds - deltaPx / pixelsPerSecond));

export const draggedSecondsOf = (
  startSeconds: number,
  deltaPx: number,
  pixelsPerSecond: number,
): number => startSeconds + deltaPx / pixelsPerSecond;

const tickWeightOf = (count: number): RulerTickWeight => {
  if (count === DOWNBEAT) {
    return 'eight';
  }

  return count === HALF_EIGHT_COUNT ? 'half' : 'count';
};

const shortestGapOf = (marks: readonly CountMark[]): number => {
  let shortest = Number.POSITIVE_INFINITY;
  marks.forEach((mark, index) => {
    const next = marks[index + 1];
    if (next !== undefined) {
      shortest = Math.min(shortest, next.seconds - mark.seconds);
    }
  });

  return shortest;
};

const labelStrideOf = (secondsPerEight: number, pixelsPerSecond: number): number =>
  LABEL_STRIDES.find((stride) => stride * secondsPerEight * pixelsPerSecond >= MIN_LABEL_GAP_PX) ??
  LABEL_STRIDES.at(-1) ??
  1;

export const rulerOf = (marks: readonly CountMark[], pixelsPerSecond: number): Ruler => {
  const beat = shortestGapOf(marks);
  const showCounts = beat * pixelsPerSecond >= MIN_COUNT_GAP_PX;
  const stride = labelStrideOf(beat * 8, pixelsPerSecond);
  const ticks: RulerTick[] = [];
  const labels: RulerLabel[] = [];
  let eight = 0;

  for (const mark of marks) {
    const weight = tickWeightOf(mark.count);
    if (weight === 'eight') {
      eight += 1;
      if ((eight - 1) % stride === 0) {
        labels.push({ seconds: mark.seconds, eight });
      }
    }
    if (showCounts || weight === 'eight') {
      ticks.push({ seconds: mark.seconds, weight });
    }
  }

  return { ticks, labels };
};

export const snappedToCountOf = (
  seconds: number,
  marks: readonly CountMark[],
  toleranceSeconds: number,
): number => {
  let nearest: number | null = null;

  for (const mark of marks) {
    if (nearest === null || Math.abs(mark.seconds - seconds) < Math.abs(nearest - seconds)) {
      nearest = mark.seconds;
    }
  }

  return nearest !== null && Math.abs(nearest - seconds) <= toleranceSeconds ? nearest : seconds;
};

export interface CountReading {
  eight: number;
  count: number;
}

export const countReadingAt = (
  marks: readonly CountMark[],
  seconds: number,
): CountReading | null => {
  let eight = 0;
  let reading: CountReading | null = null;

  for (const mark of marks) {
    if (mark.seconds > seconds + READING_TOLERANCE_SECONDS) {
      break;
    }
    if (mark.count === DOWNBEAT) {
      eight += 1;
    }
    reading = eight === 0 ? null : { eight, count: mark.count };
  }

  return reading;
};
