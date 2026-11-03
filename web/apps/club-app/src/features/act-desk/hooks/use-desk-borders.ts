import { neighbourCountOf } from '@furria/studio/music-timeline';
import { useState } from 'react';
import { useGestureRelease } from '@/features/act-studio/hooks/use-gesture-release';
import type { StudioScreen } from '@/features/act-studio/hooks/use-studio-screen';
import { borderMovedOf } from '@/features/act-studio/studio-edits';
import { borderLabelOf, clockOf } from '../desk-copy';

export interface DeskBorder {
  key: string;
  seconds: number;
  label: string;
  valueText: string;
  move: (seconds: number) => void;
  end: () => void;
  onNudge: (direction: -1 | 1) => void;
}

export interface DeskBorders {
  borders: DeskBorder[];
  stretch: (stepId: number, direction: -1 | 1) => void;
  canStretch: (stepId: number) => boolean;
}

export const useDeskBorders = (screen: StudioScreen): DeskBorders => {
  const { playback } = screen;
  const work = screen.document;
  const { steps, length, countMarks } = playback;
  const [activeId, setActiveId] = useState<number | null>(null);
  useGestureRelease(activeId !== null, work.endGesture);

  const moveTo = (beforeId: number, afterId: number, seconds: number): void => {
    const moved = borderMovedOf(steps, beforeId, seconds, countMarks)[afterId]?.start;
    if (moved !== undefined) {
      work.change({ kind: 'stepMove', stepId: afterId, atSeconds: moved, lengthSeconds: length });
    }
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
    moveTo(before.stepId, after.stepId, target);
  };

  const locked = screen.evening !== null;
  const borders = (locked ? [] : steps.slice(0, -1)).flatMap((before, index) => {
    const after = steps[index + 1];
    if (after === undefined || after.startSeconds === null) {
      return [];
    }
    const seconds = after.startSeconds;

    return [
      {
        key: `border-${before.stepId}`,
        seconds,
        label: borderLabelOf(before.name, after.name),
        valueText: clockOf(seconds),
        move: (to: number) => {
          setActiveId(before.stepId);
          work.startGesture();
          moveTo(before.stepId, after.stepId, to);
        },
        end: () => {
          setActiveId(null);
          work.endGesture();
        },
        onNudge: (direction: -1 | 1) => {
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
