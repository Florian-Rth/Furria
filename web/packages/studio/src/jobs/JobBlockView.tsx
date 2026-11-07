import type { JobBlock } from '@furria/studio/edit-jobs-view';
import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobReasonLine } from '@furria/studio/JobReasonLine';
import { JobSectionView } from '@furria/studio/JobSectionView';
import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';

interface JobBlockViewProps {
  block: JobBlock;
  heading: string | null;
}

export const JobBlockView: FC<JobBlockViewProps> = ({ block, heading }) => {
  const owner = block.owner === heading ? null : block.owner;
  const sections = block.sections.map((section) => (
    <JobSectionView key={section.key} owner={block.title} section={section} />
  ));
  const reasoned = block.danger === null ? [] : [block.danger];
  const danger =
    block.danger === null ? null : (
      <KkEjPanel.Danger>
        <JobActionButton action={block.danger} />
        <JobReasonLine actions={reasoned} />
      </KkEjPanel.Danger>
    );

  return (
    <KkEjPanel.Block label={block.title}>
      <KkEjPanel.Context owner={owner} title={block.title} meta={block.meta} />
      {sections}
      {danger}
    </KkEjPanel.Block>
  );
};
