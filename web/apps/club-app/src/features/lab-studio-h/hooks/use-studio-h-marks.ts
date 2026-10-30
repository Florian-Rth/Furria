import { useState } from 'react';
import { partRangeOf } from '@/features/act-player/music-timeline';
import { borderLabelOf, fineClockOf, markLabelOf } from '../studio-h-copy';
import { borderMovedOf } from '../studio-h-edits';
import type { StudioH } from './use-studio-h';

export interface StudioHMarkPart {
  key: string;
  start: number;
  end: number;
  name: string;
  current: boolean;
}

export interface StudioHMarkStep {
  key: string;
  start: number;
  end: number;
  number: number;
  label: string;
  current: boolean;
  press: () => void;
}

export interface StudioHMarkBorder {
  key: string;
  share: number;
  label: string;
  text: string;
  active: boolean;
  move: (share: number) => void;
  end: () => void;
}

export interface StudioHMarks {
  parts: StudioHMarkPart[];
  steps: StudioHMarkStep[];
  borders: StudioHMarkBorder[];
}

export const useStudioHMarks = (h: StudioH): StudioHMarks => {
  const { playback, practice, edits } = h;
  const { steps, parts, length, countMarks } = playback;
  const [activeId, setActiveId] = useState<number | null>(null);
  const shareOf = (seconds: number | null): number =>
    length <= 0 || seconds === null ? 0 : seconds / length;
  const currentIndex = steps.findIndex((step) => step.stepId === practice.step?.stepId);
  const currentPartId =
    parts.find((part) => part.stepIds.includes(practice.step?.stepId ?? -1))?.partId ?? null;
  const borderSteps = [steps[currentIndex - 1], steps[currentIndex]].flatMap((before, index) => {
    const after = steps[currentIndex + index];
    return before === undefined || after === undefined || currentIndex < 0
      ? []
      : [{ before, after }];
  });

  return {
    parts: parts.flatMap((part) => {
      const range = partRangeOf(part, steps);

      return range === null
        ? []
        : [
            {
              key: String(part.partId),
              start: shareOf(range.start),
              end: shareOf(range.end),
              name: part.name,
              current: part.partId === currentPartId,
            },
          ];
    }),
    steps: steps.map((step, index) => ({
      key: String(step.stepId),
      start: shareOf(step.startSeconds),
      end: shareOf(step.endSeconds),
      number: index + 1,
      label: markLabelOf(index + 1, step.name),
      current: index === currentIndex,
      press: () => {
        practice.jumpTo(step.stepId);
      },
    })),
    borders: borderSteps.map(({ before, after }) => ({
      key: String(before.stepId),
      share: shareOf(after.startSeconds),
      label: borderLabelOf(before.name),
      text: fineClockOf(after.startSeconds ?? 0),
      active: activeId === before.stepId,
      move: (share) => {
        setActiveId(before.stepId);
        edits.setBounds(borderMovedOf(steps, before.stepId, share * length, countMarks));
      },
      end: () => {
        setActiveId(null);
      },
    })),
  };
};
