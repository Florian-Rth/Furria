import { partOfStep } from '@/features/act-player/music-timeline';
import type { StudioStep } from '@/features/acts/schemas';
import type { StepCountCell } from '../step-cards';
import { countSheetOf, countsBetweenOf, stepCountCellsOf } from '../step-cards';
import { stepCardEyebrowOf, stepCardLabelOf } from '../step-cards-copy';
import type { ActStudioStage } from './use-act-studio-stage';
import type { StepTexts } from './use-step-texts';
import { useStepTexts } from './use-step-texts';
import type { StudioScreen } from './use-studio-screen';

const NEAR = 1;

interface TimedStep extends StudioStep {
  startSeconds: number;
  endSeconds: number;
}

const isTimed = (step: StudioStep): step is TimedStep =>
  step.startSeconds !== null && step.endSeconds !== null;

export interface StepCard {
  key: string;
  start: number;
  number: string;
  name: string;
  eyebrow: string;
  label: string;
  current: boolean;
  near: boolean;
  cells: StepCountCell[];
}

export interface StepCards {
  cards: StepCard[];
  index: number;
  texts: StepTexts;
  choose: (index: number) => void;
}

export const useStepCards = (screen: StudioScreen, editor: ActStudioStage): StepCards => {
  const { practice, playback } = screen;
  const { parts, countMarks, paths } = playback;
  const steps = playback.steps.filter(isTimed);
  const texts = useStepTexts(screen);
  const selected = new Set(editor.selected);
  const keyed = selected.size === 0 ? paths : paths.filter((path) => selected.has(path.spotId));
  const sheet = countSheetOf(
    countMarks,
    keyed.flatMap((path) => path.keyframes.map((keyframe) => keyframe.seconds)),
  );
  const index = Math.max(
    0,
    steps.findIndex((step) => step.stepId === practice.step?.stepId),
  );

  return {
    cards: steps.map((step, at) => {
      const current = at === index;
      const start = step.startSeconds;
      const end = step.endSeconds;
      const near = Math.abs(at - index) <= NEAR;

      return {
        key: String(step.stepId),
        start,
        number: String(at + 1),
        name: step.name,
        eyebrow: stepCardEyebrowOf(
          at + 1,
          steps.length,
          partOfStep(parts, step.stepId)?.name ?? null,
          countsBetweenOf(countMarks, start, end),
        ),
        label: stepCardLabelOf(at + 1, steps.length, step.name),
        current,
        near,
        cells: near ? stepCountCellsOf(sheet, { start, end }) : [],
      };
    }),
    index,
    texts,
    choose: (at) => {
      const step = steps[at];
      if (step !== undefined && at !== index) {
        practice.jumpTo(step.stepId);
      }
    },
  };
};
