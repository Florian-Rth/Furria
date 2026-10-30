import { useState } from 'react';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { borderLabelOf } from '@/features/act-studio/studio-copy';
import { borderMovedOf } from '@/features/act-studio/studio-edits';
import type { StudioStep } from '@/features/acts/schemas';
import { borderTextOf } from '../focus-copy';
import { countStepOf } from '../focus-counts';
import { stepsEditableOf } from '../focus-lock';

export interface FocusBorder {
  key: string;
  share: number;
  label: string;
  text: string;
  active: boolean;
  move: (share: number) => void;
  end: () => void;
  nudge: (direction: -1 | 1) => void;
}

interface StepPair {
  before: StudioStep;
  after: StudioStep;
}

const pairsOf = (steps: readonly StudioStep[]): StepPair[] =>
  steps.flatMap((before, index) => {
    const after = steps[index + 1];
    return after === undefined ? [] : [{ before, after }];
  });

export const useFocusBorders = (screen: StudioScreen): FocusBorder[] => {
  const { playback, edits, manual } = screen;
  const { steps, length, countMarks } = playback;
  const [activeId, setActiveId] = useState<number | null>(null);

  const save = ({ before, after }: StepPair): void => {
    const moved = edits.value.bounds[after.stepId];
    if (moved === undefined) {
      return;
    }
    const clear = (): void => {
      edits.clearBounds([before.stepId, after.stepId]);
    };
    void manual.move
      .mutateAsync({ stepId: after.stepId, atSeconds: moved.start })
      .then(clear, clear);
  };

  const editable = stepsEditableOf({
    evening: screen.evening !== null,
    editing: screen.mode.editing,
  });

  if (!editable) {
    return [];
  }

  return pairsOf(steps).map((pair) => {
    const { before, after } = pair;
    const seconds = after.startSeconds ?? 0;

    return {
      key: String(before.stepId),
      share: length <= 0 ? 0 : seconds / length,
      label: borderLabelOf(before.name),
      text: borderTextOf(seconds),
      active: activeId === before.stepId,
      move: (share) => {
        setActiveId(before.stepId);
        edits.setBounds(borderMovedOf(steps, before.stepId, share * length, countMarks));
      },
      end: () => {
        setActiveId(null);
        save(pair);
      },
      nudge: (direction) => {
        const target = countStepOf(countMarks, seconds, direction);
        if (target === null) {
          return;
        }
        const bounds = borderMovedOf(steps, before.stepId, target, countMarks);
        const start = bounds[after.stepId]?.start;
        if (start !== undefined && Math.abs(start - seconds) > 1e-3) {
          manual.move.mutate({ stepId: after.stepId, atSeconds: start });
        }
      },
    };
  });
};
