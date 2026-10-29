import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMyActsQuery } from '@/features/acts/api';
import { LAB_STUDIO_TITLE, labStudioEntriesOf } from '@/features/lab-studio/lab-studio-variants';

export const LabStudioSection: FC = () => {
  const myActs = useMyActsQuery();
  const rows = labStudioEntriesOf(myActs.data?.acts ?? []).map((entry) => (
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
    <KkPanelSection title={LAB_STUDIO_TITLE}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
