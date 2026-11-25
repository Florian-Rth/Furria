import { KkHelp } from '@furria/ui/KkHelp';
import type { FC } from 'react';
import { ScreenHelpShow } from '@/features/help/components/ScreenHelpShow';
import { MANAGE_HELP_PANELS, MANAGE_HELP_SPOTS } from '../manage-help-copy';
import type { ManageBankModel } from '../manage-hub-labels';

interface ManageHelpBankProps {
  bank: ManageBankModel;
}

export const ManageHelpBank: FC<ManageHelpBankProps> = ({ bank }) => {
  const texts = bank.rows.map((row) => (
    <KkHelp.Text key={row.id}>{MANAGE_HELP_PANELS[row.id]}</KkHelp.Text>
  ));

  return (
    <KkHelp.Hint>
      <KkHelp.Title>{bank.title}</KkHelp.Title>
      {texts}
      <ScreenHelpShow spot={MANAGE_HELP_SPOTS[bank.id]} />
    </KkHelp.Hint>
  );
};
