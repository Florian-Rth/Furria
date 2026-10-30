import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMyActsQuery } from '@/features/acts/api';
import { LAB_HOME_TITLE, labHomeEntriesOf } from '@/features/lab-home/home-variants';

export const LabHomeSection: FC = () => {
  const myActs = useMyActsQuery();
  const rows = labHomeEntriesOf(myActs.data?.acts ?? []).map((entry) => (
    <KkHubRow
      key={entry.key}
      label={entry.label}
      icon="play"
      meta={entry.meta}
      component={Link}
      to={entry.path}
    />
  ));

  if (rows.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={LAB_HOME_TITLE}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
