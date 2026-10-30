import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { useMyActsQuery } from '@/features/acts/api';
import { LAB_EDITOR_TITLE, labEditorEntriesOf } from '@/features/lab-editor/editor-variants';

export const LabEditorSection: FC = () => {
  const myActs = useMyActsQuery();
  const rows = labEditorEntriesOf(myActs.data?.acts ?? []).map((entry) => (
    <KkHubRow
      key={entry.key}
      label={entry.label}
      icon="edit"
      meta={entry.meta}
      component={Link}
      to={entry.path}
    />
  ));

  if (rows.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={LAB_EDITOR_TITLE}>
      <KkPanel>{rows}</KkPanel>
    </KkPanelSection>
  );
};
