import type { KkPracticeStepsThumbDot } from '@furria/ui/KkPracticeSteps';
import { useState } from 'react';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio } from '@/features/acts/schemas';
import { isLooped } from '../practice-controls';
import {
  PRACTICE_NO_PART,
  stepsGroupMetaOf,
  stepsLoopLabelOf,
  stepsRowLabelOf,
  stepsRowMetaOf,
} from '../practice-copy';
import { stageDotsAt } from '../practice-stage';
import { stepListOf } from '../practice-step-list';
import type { Practice } from './use-practice';

export interface PracticeStepRowView {
  stepId: number;
  number: number;
  name: string;
  meta: string;
  filmed: boolean;
  current: boolean;
  looped: boolean;
  label: string;
  loopLabel: string;
  dots: KkPracticeStepsThumbDot[];
  press: () => void;
  loop: () => void;
}

export interface PracticeStepGroupView {
  key: string;
  name: string;
  meta: string;
  rows: PracticeStepRowView[];
}

export interface PracticeSteps {
  open: boolean;
  aspect: number;
  groups: PracticeStepGroupView[];
  show: () => void;
  close: () => void;
}

export const usePracticeSteps = (
  studio: Studio,
  playback: StudioPlayback,
  practice: Practice,
): PracticeSteps => {
  const [open, setOpen] = useState(false);
  const { steps, parts, countMarks, paths, stage, ownSpotId } = playback;
  const scene = { paths, spots: studio.spots, ownSpotId, stage };
  const currentId = practice.step?.stepId ?? null;
  const close = (): void => {
    setOpen(false);
  };

  const groups = stepListOf(steps, parts, studio.videos, countMarks).map((group) => ({
    key: group.key,
    name: group.name ?? PRACTICE_NO_PART,
    meta: stepsGroupMetaOf(group.start, group.end, group.rows.length),
    rows: group.rows.map((row) => {
      const step = steps.find((candidate) => candidate.stepId === row.stepId);

      return {
        stepId: row.stepId,
        number: row.number,
        name: row.name,
        meta: stepsRowMetaOf(row.start, row.end, row.eights),
        filmed: row.filmed,
        current: row.stepId === currentId,
        looped: step !== undefined && isLooped(step, practice.loop),
        label: stepsRowLabelOf(row.name),
        loopLabel: stepsLoopLabelOf(row.name),
        dots: stageDotsAt(scene, row.start).map((dot) => ({
          key: String(dot.spotId),
          x: dot.x,
          y: dot.y,
          kind: dot.kind,
        })),
        press: () => {
          practice.jumpTo(row.stepId);
          setOpen(false);
        },
        loop: () => {
          practice.loopStep(row.stepId);
        },
      };
    }),
  }));

  return {
    open,
    aspect: stage.depthMetres / stage.widthMetres,
    groups,
    show: () => {
      setOpen(true);
    },
    close,
  };
};
