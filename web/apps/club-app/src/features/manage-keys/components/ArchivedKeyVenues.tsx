import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KEY_SECTION_TITLES } from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { KeyVenuePanel } from './KeyVenuePanel';

const GROUP_GAP = 2.5;

interface ArchivedKeyVenuesProps {
  venues: readonly KeyVenue[];
  onHandOut: (venueId: number) => void;
  onTakeBack: (keyHoldingId: number) => void;
}

export const ArchivedKeyVenues: FC<ArchivedKeyVenuesProps> = ({
  venues,
  onHandOut,
  onTakeBack,
}) => {
  if (venues.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ gap: GROUP_GAP, minWidth: 0 }}>
      <KkEyebrow tone="muted">{KEY_SECTION_TITLES.archived}</KkEyebrow>
      {venues.map((venue) => (
        <KeyVenuePanel
          key={venue.venueId}
          venue={venue}
          onHandOut={onHandOut}
          onTakeBack={onTakeBack}
        />
      ))}
    </Stack>
  );
};
