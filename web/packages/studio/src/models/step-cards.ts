import type { CountTrack } from '@furria/studio/count-marks';
import { countIndexAt, countTrackOf, firstIndexFrom } from '@furria/studio/count-marks';
import type { CountMark } from '@furria/studio/music-timeline';

export interface StepCountCell {
  key: string;
  index: number;
  column: number;
  count: number;
  eight: number;
  seconds: number;
  keyed: boolean;
}

export interface CountSheet extends CountTrack {
  keyed: ReadonlySet<number>;
}

export const countSheetOf = (
  marks: readonly CountMark[],
  keySeconds: readonly number[],
): CountSheet => ({
  ...countTrackOf(marks),
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
