import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkNote } from '@furria/ui/KkNote';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  VENUE_HALLS_ADD_LABEL,
  VENUE_HALLS_EMPTY,
  VENUE_HALLS_LOADING,
  VENUE_HALLS_TITLE,
} from '../hall-builder-copy';
import { useVenueHalls } from '../hooks/use-venue-halls';

interface VenueHallsPanelProps {
  venueId: number;
}

export const VenueHallsPanel: FC<VenueHallsPanelProps> = ({ venueId }) => {
  const halls = useVenueHalls(venueId);

  if (!halls.isVisible) {
    return null;
  }

  const action: KkPanelAction = {
    label: VENUE_HALLS_ADD_LABEL,
    icon: 'add',
    onClick: halls.create,
    disabled: halls.isCreating,
  };
  const rows = halls.rows.map((row) => (
    <KkHubRow
      key={row.hallId}
      label={row.name}
      icon="tables"
      meta={row.meta}
      component={Link}
      to={row.href}
    />
  ));
  const emptyNote = halls.isLoading ? VENUE_HALLS_LOADING : VENUE_HALLS_EMPTY;
  const body = rows.length === 0 ? <KkNote tone="muted">{emptyNote}</KkNote> : rows;

  return (
    <KkPanelSection title={VENUE_HALLS_TITLE} action={action}>
      <KkPanel>{body}</KkPanel>
    </KkPanelSection>
  );
};
