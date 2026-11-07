import { jobStageOf } from '@furria/studio/job-stage';
import type { JobView } from '@furria/studio/job-view';
import { partFirstOf } from '@furria/studio/job-view';
import { scrubKeyActionsOf } from '@furria/studio/studio-key-actions';
import type { StudioScreen } from '@furria/studio/studio-screen';
import { setupShownOf, setupStartsOpen } from '@furria/studio/studio-setup';
import type { StudioSetup } from '@furria/studio/studio-setup-view';
import type { ActDesk } from '@furria/studio/use-act-desk';
import { useActDesk } from '@furria/studio/use-act-desk';
import type { ActStudioStage } from '@furria/studio/use-act-studio-stage';
import { useActStudioTakes } from '@furria/studio/use-act-studio-takes';
import type { JobArrange } from '@furria/studio/use-arrange';
import { useArrange } from '@furria/studio/use-arrange';
import type { CurrentJob } from '@furria/studio/use-current-job';
import { useCurrentJob } from '@furria/studio/use-current-job';
import { useDeskBorders } from '@furria/studio/use-desk-borders';
import type { DeskLaneRows } from '@furria/studio/use-desk-lanes';
import { useDeskLanes } from '@furria/studio/use-desk-lanes';
import { useJobConfirm } from '@furria/studio/use-job-confirm';
import { useJobSetup } from '@furria/studio/use-job-setup';
import { useJobViews } from '@furria/studio/use-job-views';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useState } from 'react';

export type JobDeskPane = 'job' | 'history' | 'setup';

export interface JobDesk {
  screen: StudioScreen;
  jobs: CurrentJob;
  desk: ActDesk;
  stage: ActStudioStage;
  arrange: JobArrange;
  lanes: DeskLaneRows;
  setup: StudioSetup;
  view: JobView;
  pane: JobDeskPane;
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

export const useJobDesk = (screen: StudioScreen, editor: ActStudioStage): JobDesk => {
  const confirm = useJobConfirm();
  const jobs = useCurrentJob(screen, confirm);
  const takes = useActStudioTakes(screen);
  const plainDesk = useActDesk(screen, editor, takes);
  const onEvening = screen.evening !== null;
  const [open, setOpen] = useState<JobDeskPane>(() =>
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
    (pane: JobDeskPane): (() => void) =>
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
