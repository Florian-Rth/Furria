import { KkHubRow, KkPanel, KkPanelSection, KkScreen, KkTitleHeader } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { MANAGE_ORIGIN } from '@/features/session';
import { HANDOVER_LAB_BANK, HANDOVER_LABS, LAB_LEAD, LAB_TITLE } from '../lab-entries';

export const LabHubPage: FC = () => {
  const rows = HANDOVER_LABS.map((lab) => (
    <KkHubRow
      key={lab.id}
      label={lab.title}
      icon={lab.icon}
      meta={lab.summary}
      component={Link}
      to={lab.to}
    />
  ));

  return (
    <KkScreen
      kind="detail"
      title={LAB_TITLE}
      origin={MANAGE_ORIGIN}
      header={<KkTitleHeader title={LAB_TITLE} lead={LAB_LEAD} />}
    >
      <KkPanelSection title={HANDOVER_LAB_BANK}>
        <KkPanel>{rows}</KkPanel>
      </KkPanelSection>
    </KkScreen>
  );
};
