import type { CountMark } from '@/features/act-player/music-timeline';

const EDGE_SECONDS = 1e-3;

export interface CountPlace {
  eight: number;
  count: number;
}

export interface StepCountCell {
  key: string;
  index: number;
  column: number;
  count: number;
  eight: number;
  seconds: number;
  keyed: boolean;
}

export interface CountSheet {
  marks: readonly CountMark[];
  eights: readonly number[];
  keyed: ReadonlySet<number>;
}

export type StepCardKey = 'toggle' | 'stepBack' | 'stepForward' | 'countBack' | 'countForward';

export interface StepCardKeyPress {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  repeat: boolean;
  typing: boolean;
  onControl: boolean;
  onWidget: boolean;
}

export const countEightsOf = (marks: readonly CountMark[]): number[] => {
  let eight = 0;

  return marks.map((mark, index) => {
    const previous = marks[index - 1];
    if (previous === undefined || mark.count <= previous.count) {
      eight += 1;
    }

    return eight;
  });
};

export const countIndexAt = (marks: readonly CountMark[], seconds: number): number => {
  let low = 0;
  let high = marks.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const mark = marks[middle];
    if (mark !== undefined && mark.seconds <= seconds + EDGE_SECONDS) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  return found;
};

export const countPlaceAt = (
  marks: readonly CountMark[],
  eights: readonly number[],
  seconds: number,
): CountPlace | null => {
  const index = countIndexAt(marks, seconds);
  const mark = marks[index];
  const eight = eights[index];

  return mark === undefined || eight === undefined ? null : { eight, count: mark.count };
};

export const neighbourCountOf = (
  marks: readonly CountMark[],
  seconds: number,
  direction: 1 | -1,
): number | null => {
  const next =
    direction === 1
      ? marks.find((mark) => mark.seconds > seconds + EDGE_SECONDS)
      : marks.findLast((mark) => mark.seconds < seconds - EDGE_SECONDS);

  return next?.seconds ?? null;
};

const firstIndexFrom = (marks: readonly CountMark[], seconds: number): number =>
  countIndexAt(marks, seconds - 2 * EDGE_SECONDS) + 1;

export const countsBetweenOf = (marks: readonly CountMark[], start: number, end: number): number =>
  Math.max(0, firstIndexFrom(marks, end) - firstIndexFrom(marks, start));

export const countSheetOf = (
  marks: readonly CountMark[],
  keySeconds: readonly number[],
): CountSheet => ({
  marks,
  eights: countEightsOf(marks),
  keyed: new Set(
    keySeconds.map((seconds) => countIndexAt(marks, seconds)).filter((index) => index >= 0),
  ),
});

export const stepCountCellsOf = (
  sheet: CountSheet,
  span: { start: number; end: number },
): StepCountCell[] => {
  const first = firstIndexFrom(sheet.marks, span.start);
  const last = firstIndexFrom(sheet.marks, span.end);

  return sheet.marks.slice(first, Math.max(first, last)).map((mark, offset) => {
    const index = first + offset;

    return {
      key: String(index),
      index,
      column: mark.count - 1,
      count: mark.count,
      eight: sheet.eights[index] ?? 1,
      seconds: mark.seconds,
      keyed: sheet.keyed.has(index),
    };
  });
};

const ARROWS: Readonly<Record<string, readonly [StepCardKey, StepCardKey]>> = {
  ArrowLeft: ['stepBack', 'countBack'],
  ArrowRight: ['stepForward', 'countForward'],
};

export const stepCardKeyOf = (press: StepCardKeyPress): StepCardKey | null => {
  if (press.repeat || press.typing || press.ctrlKey || press.metaKey || press.altKey) {
    return null;
  }
  if (press.key === ' ') {
    return press.onControl ? null : 'toggle';
  }
  const arrow = ARROWS[press.key];
  if (arrow === undefined || press.onWidget) {
    return null;
  }

  return press.shiftKey ? arrow[1] : arrow[0];
};
