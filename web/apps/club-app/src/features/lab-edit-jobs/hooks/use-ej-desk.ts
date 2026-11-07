import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { setupShownOf, setupStartsOpen } from '@furria/studio/studio-setup';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActDesk } from '@furria/studio/use-act-desk';
import { useActDesk } from '@furria/studio/use-act-desk';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useActStudioTakes } from '@furria/studio/use-act-studio-takes';
import type { DeskBorders } from '@furria/studio/use-desk-borders';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import type { DeskLaneRows } from '@furria/studio/use-desk-lanes';
import { useDeskLanes } from '@furria/studio/use-desk-lanes';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useState } from 'react';
import type { EjJobView } from '../edit-jobs-view';
import { partFirstOf } from '../edit-jobs-view';
import { jobStageOf } from '../job-stage';
import type { EjArrange } from './use-arrange';
import { useArrange } from './use-arrange';
import type { EditJobs } from './use-edit-jobs';
import { useEditJobs } from './use-edit-jobs';
import { useEjConfirm } from './use-ej-confirm';
import { useJobSetup } from './use-job-setup';
import { useJobViews } from './use-job-views';

export type EjDeskPane = 'job' | 'history' | 'setup';

export interface EjDesk {
  screen: StudioScreen;
  jobs: EditJobs;
  desk: ActDesk;
  stage: ActStudioStage;
  arrange: EjArrange;
  borders: DeskBorders;
  lanes: DeskLaneRows;
  setup: StudioSetup;
  view: EjJobView;
  pane: EjDeskPane;
  toggleHistory: () => void;
  toggleSetup: () => void;
  closePane: () => void;
  openMusic: () => void;
}

const ignore = (): void => undefined;

export const lockedVideosOf = (desk: ActDesk, openVideos: () => void): ActDesk => ({
  ...desk,
  focusVideo: ignore,
  takes: {
    ...desk.takes,
    bars: desk.takes.bars.map((bar) => ({
      ...bar,
      selected: false,
      choose: openVideos,
      moveTo: ignore,
      finish: ignore,
    })),
  },
});

export const useEjDesk = (screen: StudioScreen, editor: ActStudioStage): EjDesk => {
  const confirm = useEjConfirm();
  const jobs = useEditJobs(screen, confirm);
  const takes = useActStudioTakes(screen);
  const plainDesk = useActDesk(screen, editor, takes);
  const onEvening = screen.evening !== null;
  const [open, setOpen] = useState<EjDeskPane>(() =>
    setupStartsOpen(screen.studio, onEvening) ? 'setup' : 'job',
  );
  if (open === 'setup' && !setupShownOf(screen.studio, onEvening)) {
    setOpen('job');
  }
  const openVideos = (): void => {
    screen.openMusic('video');
  };
  const desk: ActDesk = lockedVideosOf(
    {
      ...plainDesk,
      focusPart: (partId) => {
        plainDesk.focusPart(partId);
        jobs.choose('steps');
        setOpen('job');
      },
      focusKey: (seconds) => {
        plainDesk.focusKey(seconds);
        jobs.choose('movement');
        setOpen('job');
      },
    },
    openVideos,
  );
  const stage = jobStageOf(editor, jobs.job, ignore);
  const arrange = useArrange(screen, editor);
  const borders = useDeskBorders(screen);
  const lanes = useDeskLanes(desk, borders);
  useStudioKeys(scrubKeyActionsOf(screen, lanes.centre.zoomBy), true);
  const setup = useJobSetup(screen, editor, jobs, {
    leave: () => {
      setOpen('job');
    },
    showStep: plainDesk.focusStep,
    showSpots: ignore,
  });
  const views = useJobViews(screen, editor, arrange, borders, confirm, ignore, ignore);
  const partFocused = plainDesk.focus === 'part' && jobs.job === 'steps';
  const toggle =
    (pane: EjDeskPane): (() => void) =>
    () => {
      setOpen((current) => (current === pane ? 'job' : pane));
    };

  return {
    screen,
    jobs: {
      job: jobs.job,
      choose: (job) => {
        jobs.choose(job);
        setOpen('job');
      },
    },
    desk,
    stage,
    arrange,
    borders,
    lanes,
    setup,
    view: partFocused ? partFirstOf(views[jobs.job]) : views[jobs.job],
    pane: open,
    toggleHistory: toggle('history'),
    toggleSetup: toggle('setup'),
    closePane: () => {
      setOpen('job');
    },
    openMusic: () => {
      screen.openMusic('music');
    },
  };
};
