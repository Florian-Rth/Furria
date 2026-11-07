import { newPartNameOf } from '@furria/studio/studio-copy';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { partSettingsOf } from '@furria/studio/studio-steps';
import type { EjAction } from '@/features/lab-edit-jobs/edit-jobs-view';
import { ejActionOf } from '@/features/lab-edit-jobs/edit-jobs-view';
import { joinPartOf, leavePartOf, SS_PART_DISSOLVE, SS_PART_NEW } from '../setup-copy';
import type { PartMove, PartMoveLock, PartRange } from '../step-list';
import { partMovesOf, partRangesOf } from '../step-list';

export interface StepPartMoves {
  actions: EjAction[];
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
  const actionOf = (move: PartMove): EjAction => {
    switch (move.kind) {
      case 'join':
        return ejActionOf(`join-${move.side}`, joinPartOf(nameOf(move.partId)), 'part', () => {
          settle(move.partId, { firstStepId: move.firstStepId, lastStepId: move.lastStepId });
        });
      case 'leave':
        return ejActionOf('leave', leavePartOf(nameOf(move.partId)), 'dissolve', () => {
          settle(move.partId, { firstStepId: move.firstStepId, lastStepId: move.lastStepId });
        });
      case 'dissolve':
        return ejActionOf('dissolve', SS_PART_DISSOLVE, 'dissolve', () => {
          work.change({ kind: 'partRemove', partId: move.partId });
        });
      case 'newPart':
        return ejActionOf('newPart', SS_PART_NEW, 'part', () => {
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
