import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelp } from '@/features/help/components/ScreenHelp';
import type { ManageHelpViewer } from '../hooks/use-manage-help-viewer';
import { MANAGE_HELP_OVERVIEW } from '../manage-help-copy';
import { ManageHelpBank } from './ManageHelpBank';
import { ManageHelpRowPreview } from './ManageHelpRowPreview';

interface ManageHelpProps {
  viewer: ManageHelpViewer;
}

export const ManageHelp: FC<ManageHelpProps> = ({ viewer }) => {
  const banks = viewer.banks.map((bank) => <ManageHelpBank key={bank.id} bank={bank} />);

  return (
    <ScreenHelp>
      <KkHelp.Hint>
        <KkHelp.Preview>
          <ManageHelpRowPreview />
        </KkHelp.Preview>
        <KkHelp.Title>{MANAGE_HELP_OVERVIEW.title}</KkHelp.Title>
        <KkHelp.Text>{MANAGE_HELP_OVERVIEW.text}</KkHelp.Text>
        <KkHelp.Text>{MANAGE_HELP_OVERVIEW.status}</KkHelp.Text>
      </KkHelp.Hint>
      {banks}
    </ScreenHelp>
  );
};
