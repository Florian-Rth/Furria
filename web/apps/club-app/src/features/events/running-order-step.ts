import type { KkSeverity } from '@furria/ui/KkSeverityGlyph';
import type { KkStepState } from '@furria/ui/step-state';
import { reviewFindingsOf, tallyOf } from '@/features/running-order/running-order-review';
import type { RunningOrderResponse } from '@/features/running-order/schemas';

export type RunningOrderStanding = 'stands' | 'changed' | 'open';

export interface RunningOrderChecks {
  acts: number;
  placed: number;
  conflicts: number;
  hints: number;
  standing: RunningOrderStanding;
  confirmedAt: string | null;
  placedState: KkStepState;
  conflictsState: KkStepState;
  conflictsSeverity: KkSeverity | undefined;
  standingState: KkStepState;
}

const standingOf = (response: RunningOrderResponse): RunningOrderStanding => {
  if (response.confirmedAt === null) {
    return 'open';
  }

  return response.changedSinceConfirmed ? 'changed' : 'stands';
};

const STANDING_STATES: Record<RunningOrderStanding, KkStepState> = {
  stands: 'done',
  changed: 'current',
  open: 'open',
};

export const runningOrderChecksOf = (response: RunningOrderResponse): RunningOrderChecks => {
  const tally = tallyOf(reviewFindingsOf(response));
  const acts = response.lines.length;
  const placed = response.lines.filter((line) => line.position !== null).length;
  const standing = standingOf(response);
  const hasActs = acts > 0;

  return {
    acts,
    placed,
    conflicts: tally.conflicts,
    hints: tally.hints,
    standing,
    confirmedAt: response.confirmedAt,
    placedState: hasActs && placed === acts ? 'done' : 'open',
    conflictsState: tally.conflicts > 0 ? 'overdue' : hasActs ? 'done' : 'open',
    conflictsSeverity: tally.conflicts > 0 ? 'conflict' : undefined,
    standingState: STANDING_STATES[standing],
  };
};
