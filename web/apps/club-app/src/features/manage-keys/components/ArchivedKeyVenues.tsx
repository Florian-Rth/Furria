import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KEY_SECTION_TITLES } from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { KeyVenuePanel } from './KeyVenuePanel';

const GROUP_GAP = 2.5;

interface ArchivedKeyVenuesProps {
  venues: readonly KeyVenue[];
  highlightedKey: string | null;
}

export const ArchivedKeyVenues: FC<ArchivedKeyVenuesProps> = ({ venues, highlightedKey }) => {
  if (venues.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ gap: GROUP_GAP, minWidth: 0 }}>
      <KkEyebrow tone="muted">{KEY_SECTION_TITLES.archived}</KkEyebrow>
      {venues.map((venue) => (
        <KeyVenuePanel key={venue.venueId} venue={venue} highlightedKey={highlightedKey} />
      ))}
    </Stack>
  );
};
