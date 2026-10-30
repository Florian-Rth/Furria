import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMyActsQuery } from '@/features/acts/api';
import { LAB_HALL_TITLE, labHallEntriesOf } from '@/features/lab-hall/hall-variants';

export const LabHallSection: FC = () => {
  const myActs = useMyActsQuery();
  const rows = labHallEntriesOf(myActs.data?.acts ?? []).map((entry) => (
    <KkHubRow
      key={entry.key}
      label={entry.label}
      icon="music"
      meta={entry.meta}
      component={Link}
      to={entry.path}
    />
  ));

  if (rows.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={LAB_HALL_TITLE}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
