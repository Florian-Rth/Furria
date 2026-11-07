import { KkEjPanel } from '@furria/ui/KkEjPanel';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';
import type { EjListRow } from '../edit-jobs-view';

interface EjSpotsSectionProps {
  title: string;
  aside: string | null;
  rows: readonly EjListRow[];
}

export const EjSpotsSection: FC<EjSpotsSectionProps> = ({ title, aside, rows }) => {
  const shown = rows.map((row) => (
    <KkStudioList.Row
      key={row.key}
      lead={row.lead}
      title={row.title}
      meta={row.meta}
      badge={row.badge}
      badgeTone="ink"
      selected={row.selected}
      label={row.label}
      onPress={row.press}
    />
  ));

  return (
    <KkEjPanel.Group label={title}>
      <KkEjPanel.GroupHead text={title} aside={aside} />
      {shown}
    </KkEjPanel.Group>
  );
};
