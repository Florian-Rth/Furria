import { KkHubRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { ManageBankModel } from '../manage-hub-labels';

interface ManageBankProps {
  bank: ManageBankModel;
}

export const ManageBank: FC<ManageBankProps> = ({ bank }) => {
  const rows = bank.rows.map((row) => (
    <KkHubRow
      key={row.id}
      label={row.title}
      icon={row.icon}
      meta={row.summary}
      hint={row.status?.label}
      hintTone={row.status?.tone}
      component={Link}
      to={row.to}
    />
  ));

  return (
    <KkPanelSection title={bank.title}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
