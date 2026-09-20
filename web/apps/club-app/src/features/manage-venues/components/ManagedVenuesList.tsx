import { KkButton, KkEmptyState, KkIcon, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MANAGE_VENUES_CREATE_LABEL, MANAGED_VENUES_EMPTY } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ManagedVenueCard } from './ManagedVenueCard';

const LIST_GAP = 1.5;

interface ManagedVenuesListProps {
  venues: readonly ManagedVenue[];
  onCreate: () => void;
  onEdit: (venueId: number) => void;
  onArchive: (venueId: number) => void;
}

export const ManagedVenuesList: FC<ManagedVenuesListProps> = ({
  venues,
  onCreate,
  onEdit,
  onArchive,
}) => {
  if (venues.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState
          title={MANAGED_VENUES_EMPTY.title}
          description={MANAGED_VENUES_EMPTY.description}
          action={
            <KkButton startIcon={<KkIcon name="add" size="small" />} onClick={onCreate}>
              {MANAGE_VENUES_CREATE_LABEL}
            </KkButton>
          }
        />
      </KkPanel>
    );
  }

  return (
    <Stack sx={{ gap: LIST_GAP, minWidth: 0 }}>
      {venues.map((venue) => (
        <ManagedVenueCard key={venue.venueId} venue={venue} onEdit={onEdit} onArchive={onArchive} />
      ))}
    </Stack>
  );
};
