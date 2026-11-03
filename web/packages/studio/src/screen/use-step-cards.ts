import { countsBetweenOf } from '@furria/studio/count-marks';
import { partOfStep } from '@furria/studio/music-timeline';
import type { StepCountCell } from '@furria/studio/step-cards';
import { countSheetOf, stepCountCellsOf } from '@furria/studio/step-cards';
import { stepCardEyebrowOf, stepCardLabelOf } from '@furria/studio/step-cards-copy';
import type { StudioStep } from '@furria/studio/studio-schemas';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { StepTexts } from '@furria/studio/use-step-texts';
import { useStepTexts } from '@furria/studio/use-step-texts';

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
