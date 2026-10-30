import type { CountMark } from '@/features/act-player/music-timeline';

export const ZOOM_FACTOR = 1.6;
const COUNT_AT_CLOSEST_PX = 64;
const FALLBACK_BEAT_SECONDS = 0.5;
const EDGE = 1e-3;
const RULER_STEPS_SECONDS: readonly number[] = [1, 2, 5, 10, 15, 30, 60, 120];
const RULER_LABEL_PX = 72;
const BEAT_TICK_PX = 6;
const COUNT_LABEL_PX = 20;
const EIGHT_LABEL_PX = 18;
const COUNTS_PER_EIGHT = 8;

export interface ZoomRange {
  min: number;
  max: number;
}

export interface LaneTick {
  key: string;
  share: number;
  strong: boolean;
  text: string | null;
}

export interface CountPlace {
  eight: number;
  count: number;
}

const clamp = (value: number, low: number, high: number): number =>
  Math.min(high, Math.max(low, value));

export const beatSecondsOf = (marks: readonly CountMark[]): number => {
  const gaps = marks
    .slice(1)
    .map((mark, index) => mark.seconds - (marks[index]?.seconds ?? mark.seconds))
    .filter((gap) => gap > 0)
    .sort((left, right) => left - right);

  return gaps[Math.floor(gaps.length / 2)] ?? FALLBACK_BEAT_SECONDS;
};

export const zoomRangeOf = (length: number, visible: number, beatSeconds: number): ZoomRange => {
  const min = length > 0 && visible > 0 ? visible / length : 1;

  return { min, max: Math.max(min, COUNT_AT_CLOSEST_PX / beatSeconds) };
};

export const zoomedOf = (current: number, direction: 1 | -1, range: ZoomRange): number =>
  clamp(current * ZOOM_FACTOR ** direction, range.min, range.max);

export const canZoomOf = (current: number, direction: 1 | -1, range: ZoomRange): boolean =>
  direction === 1 ? current < range.max * (1 - EDGE) : current > range.min * (1 + EDGE);

export const followLeftOf = (seconds: number, perSecond: number): number =>
  Math.max(0, seconds * perSecond);

const GLIDE_SHARE = 0.3;
const LOCK_PX = 2;

export const glidedLeftOf = (current: number, target: number): number =>
  Math.abs(target - current) <= LOCK_PX ? target : current + (target - current) * GLIDE_SHARE;

export const shareOf = (seconds: number, length: number): number =>
  length <= 0 ? 0 : clamp(seconds / length, 0, 1);

const clockOf = (seconds: number): string => {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
};

export const rulerTicksOf = (length: number, perSecond: number): LaneTick[] => {
  const step =
    RULER_STEPS_SECONDS.find((seconds) => seconds * perSecond >= RULER_LABEL_PX) ??
    RULER_STEPS_SECONDS.at(-1) ??
    60;
  const count = length <= 0 ? 0 : Math.floor(length / step) + 1;

  return Array.from({ length: count }, (_, index) => ({
    key: String(index),
    share: shareOf(index * step, length),
    strong: true,
    text: clockOf(index * step),
  }));
};

export const countPlacesOf = (marks: readonly CountMark[]): CountPlace[] => {
  let eight = 0;

  return marks.map((mark, index) => {
    if (mark.count === 1 || index === 0) {
      eight += 1;
    }
    return { eight, count: mark.count };
  });
};

export const musicTicksOf = (
  marks: readonly CountMark[],
  length: number,
  perSecond: number,
): LaneTick[] => {
  const beatPx = beatSecondsOf(marks) * perSecond;
  const places = countPlacesOf(marks);
  const everyCount = beatPx >= BEAT_TICK_PX;
  const eightLabels = beatPx * COUNTS_PER_EIGHT >= EIGHT_LABEL_PX;

  return marks.flatMap((mark, index) => {
    const one = mark.count === 1;
    if (!one && !everyCount) {
      return [];
    }
    const place = places[index];
    const eightText = eightLabels && place !== undefined ? String(place.eight) : null;
    const countText = beatPx >= COUNT_LABEL_PX ? String(mark.count) : null;

    return [
      {
        key: String(index),
        share: shareOf(mark.seconds, length),
        strong: one,
        text: one ? eightText : countText,
      },
    ];
  });
};

export const countIndexAt = (marks: readonly CountMark[], seconds: number): number => {
  let found = -1;
  for (const [index, mark] of marks.entries()) {
    if (mark.seconds <= seconds + EDGE) {
      found = index;
    }
  }
  return found;
};

export const countPlaceAt = (marks: readonly CountMark[], seconds: number): CountPlace | null =>
  countPlacesOf(marks)[countIndexAt(marks, seconds)] ?? null;

export const neighbourCountOf = (
  marks: readonly CountMark[],
  seconds: number,
  direction: 1 | -1,
): number | null => {
  const next =
    direction === 1
      ? marks.find((mark) => mark.seconds > seconds + EDGE)
      : [...marks].reverse().find((mark) => mark.seconds < seconds - EDGE);

  return next?.seconds ?? null;
};

export const countsBetweenOf = (marks: readonly CountMark[], start: number, end: number): number =>
  marks.filter((mark) => mark.seconds >= start - EDGE && mark.seconds < end - EDGE).length;

export interface StepCount {
  index: number;
  count: number;
  seconds: number;
}

export interface StepEight {
  eight: number;
  counts: StepCount[];
}

export const stepEightsOf = (
  marks: readonly CountMark[],
  start: number,
  end: number,
): StepEight[] => {
  const places = countPlacesOf(marks);
  const eights: StepEight[] = [];

  for (const [index, mark] of marks.entries()) {
    const place = places[index];
    if (place === undefined || mark.seconds < start - EDGE || mark.seconds >= end - EDGE) {
      continue;
    }
    const last = eights.at(-1);
    const count = { index, count: mark.count, seconds: mark.seconds };
    if (last === undefined || last.eight !== place.eight) {
      eights.push({ eight: place.eight, counts: [count] });
    } else {
      last.counts.push(count);
    }
  }

  return eights;
};
