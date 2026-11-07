import type { CountMark } from '@furria/studio/music-timeline';
import type { TimedStep } from './setup-progress';

const BORDER_SECONDS = 0.01;
const HALF = 0.5;

export interface ListPart {
  partId: number;
  name: string;
  stepIds: readonly number[];
}

export interface PartRange {
  partId: number;
  name: string;
  firstStepId: number;
  lastStepId: number;
}

export type StepGroup<TRow> =
  | { kind: 'part'; part: PartRange; rows: TRow[] }
  | { kind: 'loose'; key: string; rows: TRow[] };

export type PartMove =
  | { kind: 'leave'; partId: number; firstStepId: number; lastStepId: number }
  | { kind: 'dissolve'; partId: number }
  | {
      kind: 'join';
      side: 'previous' | 'next';
      partId: number;
      firstStepId: number;
      lastStepId: number;
    }
  | { kind: 'newPart'; stepId: number };

export type PartMoveLock = 'middle';

export interface PartMoves {
  moves: PartMove[];
  lock: PartMoveLock | null;
}

export const partRangesOf = (parts: readonly ListPart[], order: readonly number[]): PartRange[] =>
  parts
    .flatMap((part) => {
      const placed = order.filter((stepId) => part.stepIds.includes(stepId));
      const first = placed[0];
      const last = placed.at(-1);

      return first === undefined || last === undefined
        ? []
        : [{ partId: part.partId, name: part.name, firstStepId: first, lastStepId: last }];
    })
    .sort((left, right) => order.indexOf(left.firstStepId) - order.indexOf(right.firstStepId));

const rangeOfStep = (
  ranges: readonly PartRange[],
  order: readonly number[],
  stepId: number,
): PartRange | null => {
  const at = order.indexOf(stepId);

  return (
    ranges.find(
      (range) => order.indexOf(range.firstStepId) <= at && order.indexOf(range.lastStepId) >= at,
    ) ?? null
  );
};

export const stepGroupsOf = <TRow extends { stepId: number }>(
  rows: readonly TRow[],
  ranges: readonly PartRange[],
): StepGroup<TRow>[] => {
  const order = rows.map((row) => row.stepId);
  const groups: StepGroup<TRow>[] = [];

  for (const row of rows) {
    const range = rangeOfStep(ranges, order, row.stepId);
    const last = groups.at(-1);
    if (range !== null) {
      if (last?.kind === 'part' && last.part.partId === range.partId) {
        last.rows.push(row);
      } else {
        groups.push({ kind: 'part', part: range, rows: [row] });
      }
    } else if (last?.kind === 'loose') {
      last.rows.push(row);
    } else {
      groups.push({ kind: 'loose', key: `loose-${row.stepId}`, rows: [row] });
    }
  }

  return groups;
};

export const partMovesOf = (
  ranges: readonly PartRange[],
  order: readonly number[],
  stepId: number,
): PartMoves => {
  const at = order.indexOf(stepId);
  const previous = order[at - 1];
  const next = order[at + 1];
  const own = rangeOfStep(ranges, order, stepId);

  if (own !== null) {
    const first = own.firstStepId === stepId;
    const last = own.lastStepId === stepId;
    if (first && last) {
      return { moves: [{ kind: 'dissolve', partId: own.partId }], lock: null };
    }
    if (first && next !== undefined) {
      return {
        moves: [
          { kind: 'leave', partId: own.partId, firstStepId: next, lastStepId: own.lastStepId },
        ],
        lock: null,
      };
    }
    if (last && previous !== undefined) {
      return {
        moves: [
          { kind: 'leave', partId: own.partId, firstStepId: own.firstStepId, lastStepId: previous },
        ],
        lock: null,
      };
    }

    return { moves: [], lock: 'middle' };
  }

  const before = previous === undefined ? null : rangeOfStep(ranges, order, previous);
  const after = next === undefined ? null : rangeOfStep(ranges, order, next);
  const joins: PartMove[] = [
    ...(before === null
      ? []
      : [
          {
            kind: 'join' as const,
            side: 'previous' as const,
            partId: before.partId,
            firstStepId: before.firstStepId,
            lastStepId: stepId,
          },
        ]),
    ...(after === null
      ? []
      : [
          {
            kind: 'join' as const,
            side: 'next' as const,
            partId: after.partId,
            firstStepId: stepId,
            lastStepId: after.lastStepId,
          },
        ]),
  ];

  return { moves: [...joins, { kind: 'newPart', stepId }], lock: null };
};

export const splitSecondsOf = (
  step: TimedStep,
  counts: readonly CountMark[],
  playhead: number,
): number | null => {
  const inside = counts.filter(
    (mark) =>
      mark.seconds > step.start + BORDER_SECONDS && mark.seconds < step.end - BORDER_SECONDS,
  );
  if (inside.length === 0) {
    return null;
  }
  const aim =
    playhead > step.start + BORDER_SECONDS && playhead < step.end - BORDER_SECONDS
      ? playhead
      : step.start + (step.end - step.start) * HALF;

  return inside.reduce((best, mark) =>
    Math.abs(mark.seconds - aim) < Math.abs(best.seconds - aim) ? mark : best,
  ).seconds;
};
