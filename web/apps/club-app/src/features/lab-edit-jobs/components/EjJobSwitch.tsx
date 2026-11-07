import { KkEjJobs } from '@furria/ui/KkEjJobs';
import type { FC } from 'react';
import { EDIT_JOBS } from '../edit-jobs';
import { EJ_JOB_GLYPH, EJ_JOB_TEXT, EJ_JOBS_LABEL } from '../edit-jobs-copy';
import type { EditJobs } from '../hooks/use-edit-jobs';

interface EjJobSwitchProps {
  jobs: EditJobs;
}

export const EjJobSwitch: FC<EjJobSwitchProps> = ({ jobs }) => {
  const segments = EDIT_JOBS.map((job) => {
    const choose = (): void => {
      jobs.choose(job);
    };

    return (
      <KkEjJobs.Segment
        key={job}
        text={EJ_JOB_TEXT[job]}
        glyph={EJ_JOB_GLYPH[job]}
        current={jobs.job === job}
        onChoose={choose}
      />
    );
  });

  return <KkEjJobs label={EJ_JOBS_LABEL}>{segments}</KkEjJobs>;
};
