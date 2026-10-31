import { useState } from 'react';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { borderMovedOf } from '@/features/act-studio/studio-edits';
import { borderLabelOf, clockOf, snapHintOf } from '../desk-copy';
import { countPlaceAt, neighbourCountOf, shareOf } from '../desk-time';

export interface DeskBorder {
  key: string;
  share: number;
  label: string;
  value: string;
  active: boolean;
  hint: string;
  move: (share: number) => void;
  end: () => void;
  nudge: (direction: -1 | 1) => void;
}

export interface DeskBorders {
  borders: DeskBorder[];
  stretch: (stepId: number, direction: -1 | 1) => void;
  canStretch: (stepId: number) => boolean;
}

export const useDeskBorders = (screen: StudioScreen): DeskBorders => {
  const { playback, edits, manual } = screen;
  const { steps, length, countMarks } = playback;
  const [activeId, setActiveId] = useState<number | null>(null);

  const save = (beforeId: number, afterId: number): void => {
    const moved = edits.value.bounds[afterId];
    if (moved === undefined) {
      return;
    }
    const clear = (): void => {
      edits.clearBounds([beforeId, afterId]);
    };
    void manual.move.mutateAsync({ stepId: afterId, atSeconds: moved.start }).then(clear, clear);
  };

  const nudgeAt = (index: number, direction: -1 | 1): void => {
    const before = steps[index];
    const after = steps[index + 1];
    if (before === undefined || after === undefined || after.startSeconds === null) {
      return;
    }
    const target = neighbourCountOf(countMarks, after.startSeconds, direction);
    if (target === null) {
      return;
    }
    const bounds = borderMovedOf(steps, before.stepId, target, countMarks);
    const moved = bounds[after.stepId]?.start;
    if (moved === undefined || Math.abs(moved - after.startSeconds) < 1e-3) {
      return;
    }
    manual.move.mutate({ stepId: after.stepId, atSeconds: moved });
  };

  const locked = screen.evening !== null;
  const borders = (locked ? [] : steps.slice(0, -1)).flatMap((before, index) => {
    const after = steps[index + 1];
    if (after === undefined || after.startSeconds === null) {
      return [];
    }
    const seconds = after.startSeconds;
    const place = countPlaceAt(countMarks, seconds);

    return [
      {
        key: String(before.stepId),
        share: shareOf(seconds, length),
        label: borderLabelOf(before.name, after.name),
        value: clockOf(seconds),
        active: activeId === before.stepId,
        hint: snapHintOf(place?.eight ?? null, place?.count ?? null, seconds),
        move: (share: number) => {
          setActiveId(before.stepId);
          edits.setBounds(borderMovedOf(steps, before.stepId, share * length, countMarks));
        },
        end: () => {
          setActiveId(null);
          save(before.stepId, after.stepId);
        },
        nudge: (direction: -1 | 1) => {
          nudgeAt(index, direction);
        },
      },
    ];
  });

  return {
    borders,
    stretch: (stepId, direction) => {
      const index = steps.findIndex((step) => step.stepId === stepId);
      if (index >= 0) {
        nudgeAt(index, direction);
      }
    },
    canStretch: (stepId) => {
      const index = steps.findIndex((step) => step.stepId === stepId);
      return !locked && index >= 0 && index < steps.length - 1;
    },
  };
};
