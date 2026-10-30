import type { StepText } from '../studio-edits';
import type { StudioScreen } from './use-studio-screen';

const draftsOf = (texts: Readonly<Record<number, StepText>>): [number, StepText][] =>
  Object.entries(texts).map(([stepId, text]) => [Number(stepId), text]);

export interface StepTexts {
  name: string;
  description: string;
  rename: (value: string) => void;
  describe: (value: string) => void;
  commit: () => void;
}

export const useStepTexts = (screen: StudioScreen): StepTexts => {
  const { practice, edits, manual } = screen;
  const step = practice.step;
  const name = step?.name ?? '';
  const description = step?.description ?? '';

  return {
    name,
    description,
    rename: (value) => {
      if (step !== null) {
        edits.setText(step.stepId, { name: value, description });
      }
    },
    describe: (value) => {
      if (step !== null) {
        edits.setText(step.stepId, { name, description: value });
      }
    },
    commit: () => {
      for (const [stepId, draft] of draftsOf(edits.value.texts)) {
        const clear = (): void => {
          edits.clearText(stepId, draft);
        };
        void manual.describe
          .mutateAsync({
            stepId,
            name: draft.name.trim(),
            description: draft.description.trim() || null,
          })
          .then(clear, clear);
      }
    },
  };
};
