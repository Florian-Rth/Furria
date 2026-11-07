import type { JobView } from '@furria/studio/edit-jobs-view';
import { JobBlockView } from '@furria/studio/JobBlockView';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
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

  return <KkEjPanel label={label}>{blocks}</KkEjPanel>;
};
