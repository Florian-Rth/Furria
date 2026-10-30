import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import { EDGE_TOLERANCE_SECONDS } from '@/features/act-player/music-timeline';

const FIRST_COUNT = 1;
const NO_MARK = -1;

export interface EightPlace {
  eight: number;
  eights: number;
}

export const stepMarksOf = (
  marks: readonly CountMark[],
  range: TimelineRange | null,
): CountMark[] =>
  range === null
    ? []
    : marks.filter(
        (mark) =>
          mark.seconds >= range.start - EDGE_TOLERANCE_SECONDS &&
          mark.seconds < range.end - EDGE_TOLERANCE_SECONDS,
      );

export const countGroupsOf = (marks: readonly CountMark[]): number[][] => {
  const groups: number[][] = [];

  for (const mark of marks) {
    const last = groups.at(-1);
    if (last === undefined || mark.count === FIRST_COUNT) {
      groups.push([mark.count]);
    } else {
      last.push(mark.count);
    }
  }

  return groups;
};

export const markIndexAt = (marks: readonly CountMark[], seconds: number): number =>
  marks.findLastIndex((mark) => mark.seconds <= seconds + EDGE_TOLERANCE_SECONDS);

export const eightPlaceOf = (
  groups: readonly (readonly number[])[],
  index: number,
): EightPlace | null => {
  if (index === NO_MARK) {
    return null;
  }

  let seen = 0;
  for (const [position, group] of groups.entries()) {
    seen += group.length;
    if (index < seen) {
      return { eight: position + 1, eights: groups.length };
    }
  }

  return null;
};
