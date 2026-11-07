import type { SetupTask } from '@furria/studio/setup-task';
import { unnamedStepNameOf } from '@furria/studio/step-names';
import { nameLabelOf, SS_NAMES_HINT } from '@furria/studio/step-setup-copy';
import type { SetupTimeline } from '@furria/studio/use-setup-timeline';
import { useSetupTimeline } from '@furria/studio/use-setup-timeline';
import type { StepSetup } from '@furria/studio/use-step-setup';
import { useState } from 'react';

export interface NameRow {
  key: string;
  number: number;
  value: string;
  placeholder: string;
  label: string;
  current: boolean;
  change: (value: string) => void;
  commit: () => void;
  focus: () => void;
}

export interface SetupNames {
  task: SetupTask;
  rows: NameRow[];
  timeline: SetupTimeline;
}

export const useSetupNames = (setup: StepSetup): SetupNames => {
  const { screen, videoSteps, steps } = setup;
  const work = screen.document;
  const { practice } = screen;
  const [chosenId, setChosenId] = useState<number | null>(videoSteps[0]?.stepId ?? null);
  const currentId = videoSteps.some((step) => step.stepId === chosenId)
    ? chosenId
    : (videoSteps[0]?.stepId ?? null);
  const timeline = useSetupTimeline(setup, {
    targets: [],
    startAt: videoSteps[0]?.start ?? null,
    selectedStepId: currentId,
    stepTaps: (stepId) => {
      practice.jumpTo(stepId);
      setChosenId(stepId);
    },
  });
  const write = (stepId: number, name: string): void => {
    work.change({ kind: 'stepName', stepId, name });
  };
  const rows = videoSteps.map((step): NameRow => {
    const number = steps.findIndex((candidate) => candidate.stepId === step.stepId) + 1;

    return {
      key: String(step.stepId),
      number,
      value: step.name,
      placeholder: unnamedStepNameOf(number),
      label: nameLabelOf(number),
      current: step.stepId === currentId,
      change: (value) => {
        write(step.stepId, value);
      },
      commit: () => {
        write(step.stepId, step.name.trim());
      },
      focus: () => {
        if (step.stepId !== currentId) {
          setChosenId(step.stepId);
          practice.jumpTo(step.stepId);
        }
      },
    };
  });

  return {
    task: { sentence: SS_NAMES_HINT, tools: [], more: [] },
    rows,
    timeline,
  };
};
