import type { CountMark, TimelineRange } from '@/features/act-player/music-timeline';

const COUNTS_PER_EIGHT = 8;

export interface EightProgress {
  eight: number;
  eights: number;
  share: number;
}

const firstIndexFrom = (marks: readonly CountMark[], seconds: number): number => {
  let low = 0;
  let high = marks.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    const mark = marks[middle];

    if (mark !== undefined && mark.seconds < seconds) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }

  return low;
};

export const beatsIn = (marks: readonly CountMark[], range: TimelineRange): number =>
  firstIndexFrom(marks, range.end) - firstIndexFrom(marks, range.start);

export const eightsIn = (marks: readonly CountMark[], range: TimelineRange): number =>
  beatsIn(marks, range) / COUNTS_PER_EIGHT;

const beatsElapsed = (
  marks: readonly CountMark[],
  first: number,
  range: TimelineRange,
  seconds: number,
): number => {
  const next = firstIndexFrom(marks, seconds + Number.EPSILON);
  const passed = next - first;

  if (passed <= 0) {
    return 0;
  }

  const last = marks[next - 1];
  const following = marks[next];
  const beatEnd = following === undefined ? range.end : Math.min(following.seconds, range.end);

  if (last === undefined || beatEnd <= last.seconds) {
    return passed;
  }

  return passed - 1 + Math.min(1, (seconds - last.seconds) / (beatEnd - last.seconds));
};

export const eightProgressAt = (
  marks: readonly CountMark[],
  range: TimelineRange,
  seconds: number,
): EightProgress | null => {
  const beats = beatsIn(marks, range);

  if (beats === 0) {
    return null;
  }

  const eights = Math.ceil(beats / COUNTS_PER_EIGHT);
  const clamped = Math.min(Math.max(seconds, range.start), range.end);
  const elapsed = Math.min(
    beatsElapsed(marks, firstIndexFrom(marks, range.start), range, clamped),
    beats,
  );
  const eight = Math.min(Math.floor(elapsed / COUNTS_PER_EIGHT), eights - 1);

  return { eight, eights, share: (elapsed - eight * COUNTS_PER_EIGHT) / COUNTS_PER_EIGHT };
};
