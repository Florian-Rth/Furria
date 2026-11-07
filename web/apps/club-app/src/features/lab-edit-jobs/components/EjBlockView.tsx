import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjBlock } from '../edit-jobs-view';
import { EjActionButton } from './EjActionButton';
import { EjReasonLine } from './EjReasonLine';
import { EjSectionView } from './EjSectionView';

interface EjBlockViewProps {
  block: EjBlock;
  heading: string | null;
}

export const EjBlockView: FC<EjBlockViewProps> = ({ block, heading }) => {
  const owner = block.owner === heading ? null : block.owner;
  const sections = block.sections.map((section) => (
    <EjSectionView key={section.key} owner={block.title} section={section} />
  ));
  const reasoned = block.danger === null ? [] : [block.danger];
  const danger =
    block.danger === null ? null : (
      <KkEjPanel.Danger>
        <EjActionButton action={block.danger} />
        <EjReasonLine actions={reasoned} />
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
