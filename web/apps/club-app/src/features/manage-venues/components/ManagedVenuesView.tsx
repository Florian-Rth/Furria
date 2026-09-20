import { KkNote } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useVenueDialogs } from '../hooks/use-venue-dialogs';
import { findManagedVenue, MANAGE_VENUES_FOOTNOTE, partitionVenues } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { ArchivedVenuesPanel } from './ArchivedVenuesPanel';
import { ArchiveVenueDialog } from './ArchiveVenueDialog';
import { ManagedVenuesList } from './ManagedVenuesList';
import { RestoreVenueDialog } from './RestoreVenueDialog';
import { VenueFormDialog } from './VenueFormDialog';

const VIEW_GAP = 3;

interface ManagedVenuesViewProps {
  venues: readonly ManagedVenue[];
  onCreate: () => void;
}

export const ManagedVenuesView: FC<ManagedVenuesViewProps> = ({ venues, onCreate }) => {
  const dialogs = useVenueDialogs();
  const { running, archived } = partitionVenues(venues);
  const target = findManagedVenue(venues, dialogs.venueId);

  return (
    <>
      <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
        <ManagedVenuesList
          venues={running}
          onCreate={onCreate}
          onEdit={dialogs.openEdit}
          onArchive={dialogs.openArchive}
        />
        <ArchivedVenuesPanel venues={archived} onRestore={dialogs.openRestore} />
        <KkNote>{MANAGE_VENUES_FOOTNOTE}</KkNote>
      </Stack>
      <VenueFormDialog
        venue={target}
        open={dialogs.kind === 'edit'}
        onClose={dialogs.close}
        onSaved={dialogs.close}
      />
      <ArchiveVenueDialog
        venue={target}
        open={dialogs.kind === 'archive'}
        onClose={dialogs.close}
      />
      <RestoreVenueDialog
        venue={target}
        open={dialogs.kind === 'restore'}
        onClose={dialogs.close}
      />
    </>
  );
};
