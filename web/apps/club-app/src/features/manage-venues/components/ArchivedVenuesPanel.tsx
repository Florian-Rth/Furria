import { KkPanelSection } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { VENUE_SECTION_TITLES } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ArchivedVenueCard } from './ArchivedVenueCard';

const ARCHIVED_DESCRIPTION =
  'Diese Orte stehen nicht mehr zur Auswahl. Termine und Schlüssel bleiben erhalten.';
const LIST_GAP = 1.5;

interface ArchivedVenuesPanelProps {
  venues: readonly ManagedVenue[];
}

export const ArchivedVenuesPanel: FC<ArchivedVenuesPanelProps> = ({ venues }) => {
  if (venues.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={VENUE_SECTION_TITLES.archived} description={ARCHIVED_DESCRIPTION}>
      <Stack sx={{ gap: LIST_GAP, minWidth: 0 }}>
        {venues.map((venue) => (
          <ArchivedVenueCard key={venue.venueId} venue={venue} />
        ))}
      </Stack>
    </KkPanelSection>
  );
};
