import type { StudioScreen } from '@furria/studio/studio-screen';
import { useState } from 'react';
import type { EditJob } from '../edit-jobs';
import { firstJobOf, jobToolOf } from '../edit-jobs';
import type { EjConfirm } from './use-ej-confirm';

export interface EditJobs {
  job: EditJob;
  choose: (job: EditJob) => void;
}

export const useEditJobs = (screen: StudioScreen, confirm: EjConfirm): EditJobs => {
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
