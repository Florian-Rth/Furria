import type { EditJob } from '@furria/studio/job-model';
import { firstJobOf, jobToolOf } from '@furria/studio/job-model';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import { useState } from 'react';

export interface CurrentJob {
  job: EditJob;
  choose: (job: EditJob) => void;
}

export const useCurrentJob = (screen: StudioScreen, confirm: JobConfirm): CurrentJob => {
  const [job, setJob] = useState<EditJob>(() => firstJobOf(screen.studio.steps.length));

  return {
    job,
    choose: (next) => {
      confirm.disarm();
      setJob(next);
      screen.mode.choose(jobToolOf(next));
    },
  };
};
