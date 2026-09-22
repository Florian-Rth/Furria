import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_VENUES_FOOTNOTE, partitionVenues } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ArchivedVenuesPanel } from './ArchivedVenuesPanel';
import { ManagedVenuesList } from './ManagedVenuesList';

const VIEW_GAP = 3;

interface ManagedVenuesViewProps {
  venues: readonly ManagedVenue[];
}

export const ManagedVenuesView: FC<ManagedVenuesViewProps> = ({ venues }) => {
  const { running, archived } = partitionVenues(venues);

  return (
    <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
      <ManagedVenuesList venues={running} />
      <ArchivedVenuesPanel venues={archived} />
      <KkNote>{MANAGE_VENUES_FOOTNOTE}</KkNote>
    </Stack>
  );
};
