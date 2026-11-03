import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';

export interface StepTexts {
  name: string;
  description: string;
  rename: (value: string) => void;
  describe: (value: string) => void;
  commit: () => void;
}

const descriptionOf = (value: string): string | null => (value === '' ? null : value);

export const useStepTexts = (screen: StudioWorkScreen): StepTexts => {
  const work = screen.document;
  const step = screen.practice.step;
  const name = step?.name ?? '';
  const description = step?.description ?? '';
  const texted = (nextName: string, nextDescription: string): void => {
    if (step !== null) {
      work.change({
        kind: 'stepText',
        stepId: step.stepId,
        name: nextName,
        description: descriptionOf(nextDescription),
      });
    }
  };

  return {
    name,
    description,
    rename: (value) => {
      texted(value, description);
    },
    describe: (value) => {
      texted(name, value);
    },
    commit: () => {
      texted(name.trim(), description.trim());
    },
  };
};
