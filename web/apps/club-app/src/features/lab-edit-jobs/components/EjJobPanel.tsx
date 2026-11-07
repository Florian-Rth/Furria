import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjJobView } from '../edit-jobs-view';
import { EjBlockView } from './EjBlockView';

interface EjJobPanelProps {
  label: string;
  view: EjJobView;
  heading: string | null;
}

export const EjJobPanel: FC<EjJobPanelProps> = ({ label, view, heading }) => {
  const blocks = view.blocks.map((block) => (
    <EjBlockView key={block.key} block={block} heading={heading} />
  ));

  return <KkEjPanel label={label}>{blocks}</KkEjPanel>;
};
