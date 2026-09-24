import { KkEmptyState, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useLanding } from '@/features/write';
import {
  MANAGE_KEYS_FOOTNOTE,
  NO_VENUES_DESCRIPTION,
  NO_VENUES_TITLE,
  partitionKeyVenues,
} from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { ArchivedKeyVenues } from './ArchivedKeyVenues';
import { KeyVenuePanel } from './KeyVenuePanel';

const VIEW_GAP = 3;
const GROUP_GAP = 2.5;

interface ManagedKeysViewProps {
  venues: readonly KeyVenue[];
}

export const ManagedKeysView: FC<ManagedKeysViewProps> = ({ venues }) => {
  const { highlightedKey } = useLanding();
  const { running, archived } = partitionKeyVenues(venues);

  if (venues.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState title={NO_VENUES_TITLE} description={NO_VENUES_DESCRIPTION} />
      </KkPanel>
    );
  }

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <Stack sx={{ gap: GROUP_GAP, minWidth: 0 }}>
        {running.map((venue) => (
          <KeyVenuePanel key={venue.venueId} venue={venue} highlightedKey={highlightedKey} />
        ))}
      </Stack>
      <ArchivedKeyVenues venues={archived} highlightedKey={highlightedKey} />
      <KkNote>{MANAGE_KEYS_FOOTNOTE}</KkNote>
    </Stack>
  );
};
