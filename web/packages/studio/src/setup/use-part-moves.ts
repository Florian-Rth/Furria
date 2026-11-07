import type { JobAction } from '@furria/studio/job-view';
import { jobActionOf } from '@furria/studio/job-view';
import type { PartMove, PartMoveLock, PartRange } from '@furria/studio/step-list';
import { partMovesOf, partRangesOf } from '@furria/studio/step-list';
import {
  joinPartOf,
  leavePartOf,
  SETUP_PART_DISSOLVE,
  SETUP_PART_NEW,
} from '@furria/studio/step-setup-copy';
import { newPartNameOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { partSettingsOf } from '@furria/studio/studio-steps';

export interface StepPartMoves {
  actions: JobAction[];
  lock: PartMoveLock | null;
  range: PartRange | null;
}

export interface PartMoves {
  ranges: PartRange[];
  of: (stepId: number) => StepPartMoves;
  rename: (partId: number, name: string) => void;
}

export const usePartMoves = (screen: StudioScreen): PartMoves => {
  const { playback } = screen;
  const work = screen.document;
  const order = playback.steps.flatMap((step) => (step.startSeconds === null ? [] : [step.stepId]));
  const ranges = partRangesOf(playback.parts, order);
  const nameOf = (partId: number): string =>
    ranges.find((range) => range.partId === partId)?.name ?? '';
  const settle = (
    partId: number,
    change: { name?: string; firstStepId?: number; lastStepId?: number },
  ): void => {
    const part = playback.parts.find((candidate) => candidate.partId === partId);
    if (part !== undefined) {
      work.change({ kind: 'partSettings', partId, ...partSettingsOf(part), ...change });
    }
  };
  const actionOf = (move: PartMove): JobAction => {
    switch (move.kind) {
      case 'join':
        return jobActionOf(`join-${move.side}`, joinPartOf(nameOf(move.partId)), 'parts', () => {
          settle(move.partId, { firstStepId: move.firstStepId, lastStepId: move.lastStepId });
        });
      case 'leave':
        return jobActionOf('leave', leavePartOf(nameOf(move.partId)), 'dissolve', () => {
          settle(move.partId, { firstStepId: move.firstStepId, lastStepId: move.lastStepId });
        });
      case 'dissolve':
        return jobActionOf('dissolve', SETUP_PART_DISSOLVE, 'dissolve', () => {
          work.change({ kind: 'partRemove', partId: move.partId });
        });
      case 'newPart':
        return jobActionOf('newPart', SETUP_PART_NEW, 'parts', () => {
          work.addPart(move.stepId, newPartNameOf(playback.parts.length + 1));
        });
    }
  };
  const rangeOf = (stepId: number): PartRange | null => {
    const at = order.indexOf(stepId);
    return (
      ranges.find(
        (range) => order.indexOf(range.firstStepId) <= at && order.indexOf(range.lastStepId) >= at,
      ) ?? null
    );
  };

  return {
    ranges,
    of: (stepId) => {
      const { moves, lock } = partMovesOf(ranges, order, stepId);
      return { actions: moves.map(actionOf), lock, range: rangeOf(stepId) };
    },
    rename: (partId, name) => {
      settle(partId, { name });
    },
  };
};
