import type { StudioWorkScreen } from '@furria/studio/studio-work-screen';

export interface StepNaming {
  name: string;
  rename: (value: string) => void;
  commit: () => void;
}

export const useStepNaming = (screen: StudioWorkScreen): StepNaming => {
  const work = screen.document;
  const step = screen.practice.step;
  const name = step?.name ?? '';
  const named = (nextName: string): void => {
    if (step !== null) {
      work.change({ kind: 'stepName', stepId: step.stepId, name: nextName });
    }
  };

  return {
    name,
    rename: named,
    commit: () => {
      named(name.trim());
    },
  };
};
