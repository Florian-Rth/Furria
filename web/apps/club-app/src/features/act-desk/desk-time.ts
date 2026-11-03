import type { CountMark } from '@furria/studio/music-timeline';

const FALLBACK_BEAT_SECONDS = 0.5;
const EDGE = 1e-3;
const RULER_STEPS_SECONDS: readonly number[] = [1, 2, 5, 10, 15, 30, 60, 120];
const RULER_LABEL_PX = 72;
const BEAT_TICK_PX = 6;
const COUNT_LABEL_PX = 20;
const EIGHT_LABEL_PX = 18;
const COUNTS_PER_EIGHT = 8;

export interface DeskTick {
  key: string;
  seconds: number;
  strong: boolean;
  text: string | null;
}

export interface CountPlace {
  eight: number;
  count: number;
}

export const beatSecondsOf = (marks: readonly CountMark[]): number => {
  const gaps = marks
    .slice(1)
    .map((mark, index) => mark.seconds - (marks[index]?.seconds ?? mark.seconds))
    .filter((gap) => gap > 0)
    .sort((left, right) => left - right);

  return gaps[Math.floor(gaps.length / 2)] ?? FALLBACK_BEAT_SECONDS;
};

const clockOf = (seconds: number): string => {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
};

export const rulerTicksOf = (length: number, perSecond: number): DeskTick[] => {
  const step =
    RULER_STEPS_SECONDS.find((seconds) => seconds * perSecond >= RULER_LABEL_PX) ??
    RULER_STEPS_SECONDS.at(-1) ??
    60;
  const count = length <= 0 ? 0 : Math.floor(length / step) + 1;

  return Array.from({ length: count }, (_, index) => ({
    key: String(index),
    seconds: index * step,
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

export const musicTicksOf = (marks: readonly CountMark[], perSecond: number): DeskTick[] => {
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
        seconds: mark.seconds,
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
