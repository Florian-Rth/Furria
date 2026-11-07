import { KkEjPanel } from '@furria/ui/KkEjPanel';
import type { FC } from 'react';
import type { EjAction } from '../edit-jobs-view';
import { EjActionButton } from './EjActionButton';
import { EjGroupHead } from './EjGroupHead';
import { EjReasonLine } from './EjReasonLine';

interface EjToolsSectionProps {
  label: string;
  title: string | null;
  aside: string | null;
  actions: readonly EjAction[];
}

export const EjToolsSection: FC<EjToolsSectionProps> = ({ label, title, aside, actions }) => {
  const buttons = actions.map((action) => <EjActionButton key={action.key} action={action} />);

  return (
    <KkEjPanel.Group label={label}>
      <EjGroupHead title={title} aside={aside} />
      <KkEjPanel.Tools>{buttons}</KkEjPanel.Tools>
      <EjReasonLine actions={actions} />
    </KkEjPanel.Group>
  );
};
