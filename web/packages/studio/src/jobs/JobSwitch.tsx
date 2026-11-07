import { JOB_GLYPH, JOB_TEXT, JOBS_LABEL } from '@furria/studio/job-copy';
import { EDIT_JOBS } from '@furria/studio/job-model';
import type { CurrentJob } from '@furria/studio/use-current-job';
import { KkJobSwitch } from '@furria/ui/KkJobSwitch';
import type { FC } from 'react';

interface JobSwitchProps {
  jobs: CurrentJob;
}

export const JobSwitch: FC<JobSwitchProps> = ({ jobs }) => {
  const segments = EDIT_JOBS.map((job) => {
    const choose = (): void => {
      jobs.choose(job);
    };

    return (
      <KkJobSwitch.Segment
        key={job}
        text={JOB_TEXT[job]}
        glyph={JOB_GLYPH[job]}
        current={jobs.job === job}
        onChoose={choose}
      />
    );
  });

  return <KkJobSwitch label={JOBS_LABEL}>{segments}</KkJobSwitch>;
};
