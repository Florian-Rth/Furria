import type { CountMark, TimelineRange } from '@furria/studio/music-timeline';
import type { TimedStep } from '@furria/studio/setup-progress';
import { nearBorder, STEP_BORDER_TOLERANCE_SECONDS } from '@furria/studio/step-borders';
import { snappedOf } from '@furria/studio/studio-edits';

export interface TapMarking {
  starts: readonly number[];
  counts: readonly CountMark[];
  videoStart: number;
  videoEnd: number;
  seconds: number;
  length: number;
}

export interface SetupBorder {
  key: string;
  beforeId: number;
  afterId: number;
  seconds: number;
}

const onABorder = (starts: readonly number[], seconds: number): boolean =>
  starts.some((start) => nearBorder(start, seconds));

export const tapMarksOf = ({
  starts,
  counts,
  videoStart,
  videoEnd,
  seconds,
  length,
}: TapMarking): number[] => {
  const at = snappedOf(counts, seconds);
  if (at >= length - STEP_BORDER_TOLERANCE_SECONDS || onABorder(starts, at)) {
    return [];
  }

  const opening = snappedOf(counts, videoStart);
  const opens = opening < at - STEP_BORDER_TOLERANCE_SECONDS && !onABorder(starts, opening);
  const closing = snappedOf(counts, videoEnd);
  const closes =
    closing > at + STEP_BORDER_TOLERANCE_SECONDS &&
    closing < length - STEP_BORDER_TOLERANCE_SECONDS &&
    !onABorder(starts, closing);

  return [...(opens ? [opening] : []), at, ...(closes ? [closing] : [])];
};

export const bordersInRangeOf = (
  steps: readonly TimedStep[],
  range: TimelineRange,
): SetupBorder[] =>
  steps.slice(1).flatMap((after, index) => {
    const before = steps[index];
    const inside =
      after.start >= range.start - STEP_BORDER_TOLERANCE_SECONDS &&
      after.start <= range.end + STEP_BORDER_TOLERANCE_SECONDS;
    const shared = before !== undefined && nearBorder(before.end, after.start);

    return before === undefined || !inside || !shared
      ? []
      : [
          {
            key: `border-${before.stepId}`,
            beforeId: before.stepId,
            afterId: after.stepId,
            seconds: after.start,
          },
        ];
  });

export const chosenBorderOf = (
  borders: readonly SetupBorder[],
  chosen: string | null,
): SetupBorder | null => borders.find((border) => border.key === chosen) ?? borders[0] ?? null;

export const neighbourBorderOf = (
  borders: readonly SetupBorder[],
  chosen: string | null,
  direction: -1 | 1,
): SetupBorder | null => {
  const current = chosenBorderOf(borders, chosen);
  const index = current === null ? -1 : borders.indexOf(current);

  return borders[index + direction] ?? null;
};
