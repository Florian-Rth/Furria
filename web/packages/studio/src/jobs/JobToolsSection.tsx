import type { JobAction } from '@furria/studio/edit-jobs-view';
import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobGroupHead } from '@furria/studio/JobGroupHead';
import { JobReasonLine } from '@furria/studio/JobReasonLine';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
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
    <KkEjPanel.Group label={label}>
      <JobGroupHead title={title} aside={aside} />
      <KkEjPanel.Tools>{buttons}</KkEjPanel.Tools>
      <JobReasonLine actions={actions} />
    </KkEjPanel.Group>
  );
};
