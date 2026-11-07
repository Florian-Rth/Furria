import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobGroupHead } from '@furria/studio/JobGroupHead';
import { JobReasonLine } from '@furria/studio/JobReasonLine';
import type { JobAction } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC } from 'react';

interface JobToolsSectionProps {
  label: string;
  title: string | null;
  aside: string | null;
  actions: readonly JobAction[];
}

export const JobToolsSection: FC<JobToolsSectionProps> = ({ label, title, aside, actions }) => {
  const buttons = actions.map((action) => <JobActionButton key={action.key} action={action} />);

  return (
    <KkJobPanel.Group label={label}>
      <JobGroupHead title={title} aside={aside} />
      <KkJobPanel.Tools>{buttons}</KkJobPanel.Tools>
      <JobReasonLine actions={actions} />
    </KkJobPanel.Group>
  );
};
