import type { EditJob } from '@furria/studio/edit-jobs';
import { firstJobOf, jobToolOf } from '@furria/studio/edit-jobs';
import type { StudioScreen } from '@furria/studio/studio-screen';
import type { JobConfirm } from '@furria/studio/use-job-confirm';
import { useState } from 'react';

export interface EditJobs {
  job: EditJob;
  choose: (job: EditJob) => void;
}

export const useEditJobs = (screen: StudioScreen, confirm: JobConfirm): EditJobs => {
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
