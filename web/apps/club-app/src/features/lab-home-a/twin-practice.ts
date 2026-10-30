import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';
import type { LoopKind } from '@/features/act-practice/practice-controls';
import type { OwnCue } from '@/features/act-practice/practice-way';

const COUNTS_PER_EIGHT = 8;
const EDGE_TOLERANCE_SECONDS = 1e-6;
const NO_EIGHTS = 0;

export type TwinCueTone = 'still' | 'soon' | 'now';

export type TwinLoopMove = 'step' | 'part' | 'clear';

const marksIn = (marks: readonly CountMark[], range: TimelineRange): CountMark[] =>
  marks.filter(
    (mark) =>
      mark.seconds >= range.start - EDGE_TOLERANCE_SECONDS &&
      mark.seconds < range.end - EDGE_TOLERANCE_SECONDS,
  );

export const eightsInRangeOf = (
  marks: readonly CountMark[],
  range: TimelineRange | null,
): number =>
  range === null ? NO_EIGHTS : Math.ceil(marksIn(marks, range).length / COUNTS_PER_EIGHT);

export const eightAt = (
  marks: readonly CountMark[],
  range: TimelineRange | null,
  seconds: number,
): number => {
  const eights = eightsInRangeOf(marks, range);

  if (range === null || eights === NO_EIGHTS) {
    return NO_EIGHTS;
  }

  const passed = marksIn(marks, range).filter(
    (mark) => mark.seconds <= seconds + EDGE_TOLERANCE_SECONDS,
  ).length;

  return Math.min(eights, Math.max(1, Math.ceil(passed / COUNTS_PER_EIGHT)));
};

export const cueToneOf = (cue: OwnCue | null): TwinCueTone => cue?.tone ?? 'still';

export const soonCountsOf = (cue: OwnCue | null): number | null =>
  cue?.tone === 'soon' ? cue.counts : null;

export const loopMoveOf = (kind: LoopKind): TwinLoopMove => {
  if (kind === 'off') {
    return 'step';
  }

  return kind === 'step' ? 'part' : 'clear';
};
