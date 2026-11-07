import { JobBlockView } from '@furria/studio/JobBlockView';
import type { JobView } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import type { FC } from 'react';

interface JobPanelProps {
  label: string;
  view: JobView;
  heading: string | null;
}

export const JobPanel: FC<JobPanelProps> = ({ label, view, heading }) => {
  const blocks = view.blocks.map((block) => (
    <JobBlockView key={block.key} block={block} heading={heading} />
  ));

  return <KkJobPanel label={label}>{blocks}</KkJobPanel>;
};
