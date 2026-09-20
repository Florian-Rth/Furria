import { KkEmptyState, KkNote, KkPanel } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useKeyDialogs } from '../hooks/use-key-dialogs';
import {
  findKeyHolding,
  findKeyVenue,
  MANAGE_KEYS_FOOTNOTE,
  NO_VENUES_DESCRIPTION,
  NO_VENUES_TITLE,
  partitionKeyVenues,
} from '../manage-keys-labels';
import type { KeyVenue } from '../schemas';
import { ArchivedKeyVenues } from './ArchivedKeyVenues';
import { HandOutKeyDialog } from './HandOutKeyDialog';
import { KeyVenuePanel } from './KeyVenuePanel';
import { TakeBackKeyDialog } from './TakeBackKeyDialog';

const VIEW_GAP = 3;
const GROUP_GAP = 2.5;

interface ManagedKeysViewProps {
  venues: readonly KeyVenue[];
}

export const ManagedKeysView: FC<ManagedKeysViewProps> = ({ venues }) => {
  const dialogs = useKeyDialogs();
  const { running, archived } = partitionKeyVenues(venues);
  const handoutVenue = findKeyVenue(venues, dialogs.handoutVenueId);
  const returnTarget = findKeyHolding(venues, dialogs.returnKeyHoldingId);

  if (venues.length === 0) {
    return (
      <KkPanel variant="block">
        <KkEmptyState title={NO_VENUES_TITLE} description={NO_VENUES_DESCRIPTION} />
      </KkPanel>
    );
  }

  return (
    <>
      <Stack sx={{ gap: VIEW_GAP, minWidth: 0 }}>
        <Stack sx={{ gap: GROUP_GAP, minWidth: 0 }}>
          {running.map((venue) => (
            <KeyVenuePanel
              key={venue.venueId}
              venue={venue}
              onHandOut={dialogs.openHandout}
              onTakeBack={dialogs.openReturn}
            />
          ))}
        </Stack>
        <ArchivedKeyVenues
          venues={archived}
          onHandOut={dialogs.openHandout}
          onTakeBack={dialogs.openReturn}
        />
        <KkNote>{MANAGE_KEYS_FOOTNOTE}</KkNote>
      </Stack>
      <HandOutKeyDialog venue={handoutVenue} onClose={dialogs.close} />
      <TakeBackKeyDialog target={returnTarget} onClose={dialogs.close} />
    </>
  );
};
