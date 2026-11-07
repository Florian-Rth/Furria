import { JobActionButton } from '@furria/studio/JobActionButton';
import { JobReasonLine } from '@furria/studio/JobReasonLine';
import { JobSectionView } from '@furria/studio/JobSectionView';
import type { JobBlock } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
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
      <KkJobPanel.Danger>
        <JobActionButton action={block.danger} />
        <JobReasonLine actions={reasoned} />
      </KkJobPanel.Danger>
    );

  return (
    <KkJobPanel.Block label={block.title}>
      <KkJobPanel.Context owner={owner} title={block.title} meta={block.meta} />
      {sections}
      {danger}
    </KkJobPanel.Block>
  );
};
