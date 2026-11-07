import { finishSentenceOf, SS_ALL_NAMED, SS_STAGE_TEXT, unnamedOf } from '../setup-copy';
import type { SetupStage } from '../setup-stages';
import type { SetupTask } from '../setup-task';
import type { SetupTimeline } from './use-setup-timeline';
import { useSetupTimeline } from './use-setup-timeline';
import type { StepSetup } from './use-step-setup';

export interface FinishRow {
  key: SetupStage;
  title: string;
  meta: string;
  press: () => void;
}

export interface SetupFinish {
  task: SetupTask;
  rows: FinishRow[];
  timeline: SetupTimeline;
}

export const useSetupFinish = (setup: StepSetup): SetupFinish => {
  const { progress } = setup;
  const { total } = progress;
  const timeline = useSetupTimeline(setup, { targets: [], startAt: setup.range?.start ?? null });
  const rowOf = (stage: SetupStage, meta: string): FinishRow => ({
    key: stage,
    title: SS_STAGE_TEXT[stage],
    meta,
    press: () => {
      setup.go(stage);
    },
  });

  return {
    task: { sentence: finishSentenceOf(total), tools: [], more: [] },
    rows: [rowOf('names', progress.unnamed === 0 ? SS_ALL_NAMED : unnamedOf(progress.unnamed))],
    timeline,
  };
};
