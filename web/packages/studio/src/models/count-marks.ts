import type { CountMark } from '@furria/studio/music-timeline';
import { COUNT_EDGE_SECONDS } from '@furria/studio/music-timeline';

/** A span starts after the last count before it, so a count right on the border belongs to the span. */
const SPAN_START_SLACK_SECONDS = 2 * COUNT_EDGE_SECONDS;

export interface CountPlace {
  eight: number;
  count: number;
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
    if (mark !== undefined && mark.seconds <= seconds + COUNT_EDGE_SECONDS) {
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

export const firstIndexFrom = (marks: readonly CountMark[], seconds: number): number =>
  countIndexAt(marks, seconds - SPAN_START_SLACK_SECONDS) + 1;

export const countsBetweenOf = (marks: readonly CountMark[], start: number, end: number): number =>
  Math.max(0, firstIndexFrom(marks, end) - firstIndexFrom(marks, start));
