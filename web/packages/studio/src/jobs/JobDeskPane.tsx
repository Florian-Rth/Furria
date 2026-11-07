import { JobHistoryPanel } from '@furria/studio/JobHistoryPanel';
import { JobPanel } from '@furria/studio/JobPanel';
import { backToOf, JOB_HISTORY, JOB_TEXT } from '@furria/studio/job-copy';
import { StepListPanel } from '@furria/studio/StepListPanel';
import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobDesk } from '@furria/studio/use-job-desk';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC, ReactNode } from 'react';

interface JobDeskPaneProps {
  jobDesk: JobDesk;
  versions: ReactNode;
}

export const JobDeskPane: FC<JobDeskPaneProps> = ({ jobDesk, versions }) => {
  const { screen } = jobDesk;
  const jobText = JOB_TEXT[jobDesk.jobs.job];
  const back = backToOf(jobText);

  if (jobDesk.pane === 'history') {
    return (
      <KkJobPanel label={JOB_HISTORY}>
        <KkJobPanel.Head title={JOB_HISTORY} closeText={back} onClose={jobDesk.closePane} />
        <JobHistoryPanel history={screen.history} versions={versions} />
      </KkJobPanel>
    );
  }
  if (jobDesk.pane === 'setup') {
    return (
      <KkJobPanel label={SETUP_TITLE}>
        <KkJobPanel.Head title={SETUP_TITLE} closeText={back} onClose={jobDesk.closePane} />
        <StudioSetupList setup={jobDesk.setup} />
      </KkJobPanel>
    );
  }

  if (jobDesk.jobs.job === 'steps') {
    return <StepListPanel screen={screen} />;
  }

  return <JobPanel label={jobText} view={jobDesk.view} heading={null} />;
};
