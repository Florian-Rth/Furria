import { countsBetweenOf } from '@furria/studio/count-marks';
import { partOfStep } from '@furria/studio/music-timeline';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import type { StepCards } from '@furria/studio/use-step-cards';
import { useStepCards } from '@furria/studio/use-step-cards';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useState } from 'react';
import { cardEyebrowOf, EJ_MORE } from '../edit-jobs-copy';
import type { EjAction, EjJobView } from '../edit-jobs-view';
import { ejActionOf } from '../edit-jobs-view';
import { jobStageOf } from '../job-stage';
import { swallowSequenceClick } from '../pointer-sequence';
import type { EjArrange } from './use-arrange';
import { useArrange } from './use-arrange';
import type { EditJobs } from './use-edit-jobs';
import { useEditJobs } from './use-edit-jobs';
import { useEjConfirm } from './use-ej-confirm';
import { useJobSetup } from './use-job-setup';
import { useJobViews } from './use-job-views';

export type EjPhoneDrawer = 'none' | 'more' | 'menu' | 'history' | 'setup' | 'compass';

export interface EjPhone {
  screen: StudioScreen;
  jobs: EditJobs;
  stage: ActStudioStage;
  arrange: EjArrange;
  cards: StepCards;
  setup: StudioSetup;
  view: EjJobView;
  stepsView: EjJobView;
  bar: EjAction[];
  eyebrows: ReadonlyMap<string, string>;
  drawer: EjPhoneDrawer;
  open: (drawer: EjPhoneDrawer) => void;
  close: () => void;
  toggleSetup: () => void;
  openMusic: () => void;
}

interface TimedStep {
  stepId: number;
  name: string;
  counts: number;
  part: string | null;
}

const timedStepsOf = (screen: StudioScreen): TimedStep[] => {
  const { steps, parts, countMarks } = screen.playback;

  return steps
    .filter((step) => step.startSeconds !== null && step.endSeconds !== null)
    .map((step) => ({
      stepId: step.stepId,
      name: step.name,
      counts: countsBetweenOf(countMarks, step.startSeconds ?? 0, step.endSeconds ?? 0),
      part: partOfStep(parts, step.stepId)?.name ?? null,
    }));
};

export const useEjPhone = (screen: StudioScreen, editor: ActStudioStage): EjPhone => {
  const confirm = useEjConfirm();
  const jobs = useEditJobs(screen, confirm);
  const [drawer, setDrawer] = useState<EjPhoneDrawer>('none');
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
  const more = ejActionOf('more', EJ_MORE, 'more', openMore);
  const timed = timedStepsOf(screen);

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
