import type {
  KkStudioAManualHeadState,
  KkStudioAManualStepState,
  KkStudioAManualThumbDot,
} from '@furria/ui/KkStudioAManual';
import type { StudioPlayback } from '@/features/act-player/hooks/use-studio-playback';
import type { Studio, StudioStep } from '@/features/acts/schemas';
import {
  factsOf,
  lengthTextOf,
  partMetaOf,
  STUDIO_A_CUT_AWAY,
  STUDIO_A_CUT_AWAY_FACTS,
  STUDIO_A_LOOSE,
  stepActionOf,
} from '../studio-a-copy';
import { spanOf } from '../studio-a-format';
import type { StudioAManualGroup, StudioAManualStep } from '../studio-a-manual';
import { manualOf } from '../studio-a-manual';
import { stepLengthOf } from '../studio-a-practice';
import type { StudioAStageScene } from '../studio-a-stage';
import { dotsAt } from '../studio-a-stage';
import type { StudioAPractice } from './use-studio-a-practice';

const BEFORE_END_SECONDS = 0.01;

export interface StudioAManualRow {
  key: string;
  number: string;
  title: string;
  facts: string;
  description: string | null;
  thumb: KkStudioAManualThumbDot[] | null;
  state: KkStudioAManualStepState;
  attention: boolean;
  actionLabel: string;
  select: (() => void) | undefined;
}

export interface StudioAManualSection {
  key: string;
  title: string;
  meta: string | null;
  state: KkStudioAManualHeadState;
  attention: boolean;
  loop: (() => void) | null;
  rows: StudioAManualRow[];
}

export interface StudioAManualView {
  sections: StudioAManualSection[];
  aspect: number;
}

const thumbOf = (scene: StudioAStageScene, step: StudioStep): KkStudioAManualThumbDot[] | null =>
  step.endSeconds === null
    ? null
    : dotsAt(scene, step.endSeconds - BEFORE_END_SECONDS).map((dot) => ({
        key: String(dot.spotId),
        x: dot.x,
        y: dot.y,
        kind: dot.kind,
      }));

export const useStudioAManual = (
  studio: Studio,
  playback: StudioPlayback,
  practice: StudioAPractice,
  mirrored: boolean,
): StudioAManualView => {
  const { steps, parts, countMarks, paths, ownSpotId, stage } = playback;
  const scene: StudioAStageScene = { paths, spots: studio.spots, ownSpotId, stage, mirrored };

  const rowOf = (entry: StudioAManualStep, cutAway: boolean): StudioAManualRow => {
    const { step } = entry;
    const looped = step.stepId === practice.loopedStepId;
    const current = step.stepId === practice.step?.stepId;

    return {
      key: String(step.stepId),
      number: cutAway ? '–' : String(entry.number),
      title: step.name,
      facts: cutAway
        ? STUDIO_A_CUT_AWAY_FACTS
        : factsOf([
            spanOf(step.startSeconds, step.endSeconds),
            lengthTextOf(stepLengthOf(countMarks, step)),
          ]),
      description: step.description,
      thumb: cutAway ? null : thumbOf(scene, step),
      state: looped ? 'looped' : current ? 'current' : 'rest',
      attention: cutAway,
      actionLabel: stepActionOf(entry.number, step.name),
      select: cutAway
        ? undefined
        : () => {
            practice.selectStep(step);
          },
    };
  };

  const sectionOf = (group: StudioAManualGroup): StudioAManualSection => {
    if (group.kind === 'part') {
      const { part } = group;
      const span = group.range === null ? null : spanOf(group.range.start, group.range.end);
      const looped = part.partId === practice.loopedPartId;

      return {
        key: `part-${part.partId}`,
        title: part.name,
        meta: partMetaOf(span, group.steps.length, part.mainVideoId !== null),
        state: looped ? 'looped' : part.partId === practice.part?.partId ? 'current' : 'rest',
        attention: false,
        loop: () => {
          practice.selectPart(part);
        },
        rows: group.steps.map((entry) => rowOf(entry, false)),
      };
    }

    const cutAway = group.kind === 'cutAway';

    return {
      key: group.kind,
      title: cutAway ? STUDIO_A_CUT_AWAY : STUDIO_A_LOOSE,
      meta: null,
      state: 'rest',
      attention: cutAway,
      loop: null,
      rows: group.steps.map((entry) => rowOf(entry, cutAway)),
    };
  };

  return {
    sections: manualOf(studio.steps, steps, parts).map(sectionOf),
    aspect: stage.depthMetres / stage.widthMetres,
  };
};
