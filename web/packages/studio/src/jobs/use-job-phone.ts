import { countsBetweenOf } from '@furria/studio/count-marks';
import { cardEyebrowOf, EJ_MORE } from '@furria/studio/edit-jobs-copy';
import type { JobAction, JobView } from '@furria/studio/edit-jobs-view';
import { jobActionOf } from '@furria/studio/edit-jobs-view';
import { jobStageOf } from '@furria/studio/job-stage';
import { partOfStep } from '@furria/studio/music-timeline';
import { swallowSequenceClick } from '@furria/studio/pointer-sequence';
import { timedStepsOf } from '@furria/studio/setup-progress';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import type { JobArrange } from '@furria/studio/use-arrange';
import { useArrange } from '@furria/studio/use-arrange';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import type { EditJobs } from '@furria/studio/use-edit-jobs';
import { useEditJobs } from '@furria/studio/use-edit-jobs';
import { useJobConfirm } from '@furria/studio/use-job-confirm';
import { useJobSetup } from '@furria/studio/use-job-setup';
import { useJobViews } from '@furria/studio/use-job-views';
import type { StepCards } from '@furria/studio/use-step-cards';
import { useStepCards } from '@furria/studio/use-step-cards';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useState } from 'react';

export type JobPhoneDrawer = 'none' | 'more' | 'menu' | 'history' | 'setup' | 'compass';

export interface JobPhone {
  screen: StudioScreen;
  jobs: EditJobs;
  stage: ActStudioStage;
  arrange: JobArrange;
  cards: StepCards;
  setup: StudioSetup;
  view: JobView;
  stepsView: JobView;
  bar: JobAction[];
  eyebrows: ReadonlyMap<string, string>;
  drawer: JobPhoneDrawer;
  open: (drawer: JobPhoneDrawer) => void;
  close: () => void;
  toggleSetup: () => void;
  openMusic: () => void;
}

interface CountedStep {
  stepId: number;
  name: string;
  counts: number;
  part: string | null;
}

const countedStepsOf = (screen: StudioScreen): CountedStep[] => {
  const { steps, parts, countMarks } = screen.playback;

  return timedStepsOf(steps).map((step) => ({
    stepId: step.stepId,
    name: step.name,
    counts: countsBetweenOf(countMarks, step.start, step.end),
    part: partOfStep(parts, step.stepId)?.name ?? null,
  }));
};

export const useJobPhone = (screen: StudioScreen, editor: ActStudioStage): JobPhone => {
  const confirm = useJobConfirm();
  const jobs = useEditJobs(screen, confirm);
  const [drawer, setDrawer] = useState<JobPhoneDrawer>('none');
  const openMore = (): void => {
    setDrawer('more');
  };
  const openFromStage = (): void => {
    swallowSequenceClick();
    openMore();
  };
  const stage = jobStageOf(editor, jobs.job, openFromStage);
  const arrange = useArrange(screen, editor);
  const cards = useStepCards(screen, editor);
  const borders = useDeskBorders(screen);
  useStudioKeys(scrubKeyActionsOf(screen, null), drawer === 'none');
  const close = (): void => {
    setDrawer('none');
  };
  const setup = useJobSetup(screen, editor, jobs, {
    leave: close,
    showStep: (stepId) => {
      if (stepId !== null && stepId !== screen.practice.step?.stepId) {
        screen.practice.jumpTo(stepId);
      }
    },
    showSpots: () => undefined,
  });
  const views = useJobViews(screen, editor, arrange, borders, confirm, openMore, () => {
    setDrawer('compass');
  });
  const view = views[jobs.job];
  const more = jobActionOf('more', EJ_MORE, 'more', openMore);
  const timed = countedStepsOf(screen);

  return {
    screen,
    jobs,
    stage,
    arrange,
    cards,
    setup,
    view,
    stepsView: views.steps,
    bar: [...view.bar, more],
    eyebrows: new Map(
      timed.map((step, at) => [
        String(step.stepId),
        cardEyebrowOf(at + 1, timed.length, step.part, step.counts),
      ]),
    ),
    drawer,
    open: setDrawer,
    close,
    toggleSetup: () => {
      setDrawer((current) => (current === 'setup' ? 'none' : 'setup'));
    },
    openMusic: () => {
      screen.openMusic('music');
    },
  };
};
