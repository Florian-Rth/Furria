import { KkButton } from '@furria/ui';
import type { FC } from 'react';
import { toArchivedSinceLine, toVenueAddressLine } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VenueRecord } from './VenueRecord';

const RESTORE_LABEL = 'Aktivieren';

interface ArchivedVenueCardProps {
  venue: ManagedVenue;
  onRestore: (venueId: number) => void;
}

export const ArchivedVenueCard: FC<ArchivedVenueCardProps> = ({ venue, onRestore }) => {
  const restore = (): void => {
    onRestore(venue.venueId);
  };

  const note = venue.archivedOn === null ? null : toArchivedSinceLine(venue.archivedOn);

  const actions = (
    <KkButton size="small" variant="outlined" onClick={restore}>
      {RESTORE_LABEL}
    </KkButton>
  );

  return (
    <VenueRecord
      name={venue.name}
      addressLine={toVenueAddressLine(venue)}
      hint={venue.hint}
      note={note}
      dimmed
      actions={actions}
    />
  );
};
