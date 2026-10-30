import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  LAB_HEUTE_TITLE,
  LAB_SEASON_TITLE,
  labHeuteEntriesOf,
  labSeasonEntriesOf,
} from '@/features/lab-planner/planner-variants';
import { useActSeasonQuery } from '@/features/season/api';

export const LabPlannerSection: FC = () => {
  const season = useActSeasonQuery();
  const seasonRows = labSeasonEntriesOf().map((entry) => (
    <KkHubRow
      key={entry.key}
      label={entry.label}
      icon="calendar"
      meta={entry.meta}
      component={Link}
      to={entry.path}
    />
  ));
  const heuteRows = labHeuteEntriesOf(season.data?.evenings ?? []).map((entry) => (
    <KkHubRow
      key={entry.key}
      label={entry.label}
      icon="live"
      meta={entry.meta}
      component={Link}
      to={entry.path}
    />
  ));

  if (season.data === undefined) {
    return null;
  }

  return (
    <>
      <KkPanelSection title={LAB_SEASON_TITLE}>
        <KkPanel>{seasonRows}</KkPanel>
      </KkPanelSection>
      <KkPanelSection title={LAB_HEUTE_TITLE}>
        <KkPanel>{heuteRows}</KkPanel>
      </KkPanelSection>
    </>
  );
};
