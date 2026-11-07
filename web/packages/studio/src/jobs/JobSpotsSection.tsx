import type { JobListRow } from '@furria/studio/job-view';
import { KkJobPanel } from '@furria/ui/KkJobPanel';
import { KkStudioList } from '@furria/ui/KkStudioList';
import type { FC } from 'react';

interface JobSpotsSectionProps {
  title: string;
  aside: string | null;
  rows: readonly JobListRow[];
}

export const JobSpotsSection: FC<JobSpotsSectionProps> = ({ title, aside, rows }) => {
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
    <KkJobPanel.Group label={title}>
      <KkJobPanel.GroupHead text={title} aside={aside} />
      {shown}
    </KkJobPanel.Group>
  );
};
