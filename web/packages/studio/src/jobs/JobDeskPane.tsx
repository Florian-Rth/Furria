import { backToOf, EJ_HISTORY, EJ_JOB_TEXT } from '@furria/studio/edit-jobs-copy';
import { JobHistoryPanel } from '@furria/studio/JobHistoryPanel';
import { JobPanel } from '@furria/studio/JobPanel';
import { StepListPanel } from '@furria/studio/StepListPanel';
import { StudioSetupList } from '@furria/studio/StudioSetupList';
import { SETUP_TITLE } from '@furria/studio/setup-copy';
import type { JobDesk } from '@furria/studio/use-job-desk';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC, ReactNode } from 'react';

interface JobDeskPaneProps {
  ej: JobDesk;
  versions: ReactNode;
}

export const JobDeskPane: FC<JobDeskPaneProps> = ({ ej, versions }) => {
  const { screen } = ej;
  const jobText = EJ_JOB_TEXT[ej.jobs.job];
  const back = backToOf(jobText);

  if (ej.pane === 'history') {
    return (
      <KkEjPanel label={EJ_HISTORY}>
        <KkEjPanel.Head title={EJ_HISTORY} closeText={back} onClose={ej.closePane} />
        <JobHistoryPanel history={screen.history} versions={versions} />
      </KkEjPanel>
    );
  }
  if (ej.pane === 'setup') {
    return (
      <KkEjPanel label={SETUP_TITLE}>
        <KkEjPanel.Head title={SETUP_TITLE} closeText={back} onClose={ej.closePane} />
        <StudioSetupList setup={ej.setup} />
      </KkEjPanel>
    );
  }

  if (ej.jobs.job === 'steps') {
    return <StepListPanel screen={screen} />;
  }

  return <JobPanel label={jobText} view={ej.view} heading={null} />;
};
