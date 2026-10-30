import type { StepTexts } from '@/features/act-studio/hooks/use-step-texts';
import { useStepTexts } from '@/features/act-studio/hooks/use-step-texts';
import type { StudioStep } from '@/features/acts/schemas';
import { cardEyebrowOf, cardLabelOf, cardMetaOf } from '../lane-copy';
import { countsBetweenOf } from '../lane-time';
import type { LaneEditor } from './use-lane-editor';

const NEAR = 1;

export interface LaneCard {
  key: string;
  step: StudioStep;
  number: string;
  name: string;
  eyebrow: string;
  label: string;
  current: boolean;
  near: boolean;
}

export interface LaneCards {
  cards: LaneCard[];
  index: number;
  texts: StepTexts;
  choose: (index: number) => void;
}

export const useLaneCards = (lane: LaneEditor): LaneCards => {
  const { practice, playback } = lane.screen;
  const { steps, parts } = playback;
  const texts = useStepTexts(lane.screen);
  const index = Math.max(
    0,
    steps.findIndex((step) => step.stepId === practice.step?.stepId),
  );

  return {
    cards: steps.map((step, at) => {
      const current = at === index;
      const part = parts.find((candidate) => candidate.stepIds.includes(step.stepId)) ?? null;
      const name = current ? texts.name : step.name;

      return {
        key: String(step.stepId),
        step,
        number: String(at + 1),
        name,
        eyebrow: cardMetaOf(
          cardEyebrowOf(at + 1, steps.length, part?.name ?? null),
          countsBetweenOf(playback.countMarks, step.startSeconds ?? 0, step.endSeconds ?? 0),
        ),
        label: cardLabelOf(at + 1, steps.length, step.name),
        current,
        near: Math.abs(at - index) <= NEAR,
      };
    }),
    index,
    texts,
    choose: (at) => {
      const step = steps[at];
      if (step !== undefined && at !== index) {
        lane.focusStep(step.stepId);
      }
    },
  };
};
