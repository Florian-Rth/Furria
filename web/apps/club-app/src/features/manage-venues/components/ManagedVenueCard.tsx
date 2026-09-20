import { KkButton } from '@furria/ui';
import type { FC } from 'react';
import { toVenueAddressLine } from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VenueRecord } from './VenueRecord';

const EDIT_LABEL = 'Bearbeiten';
const ARCHIVE_LABEL = 'Archivieren';

interface ManagedVenueCardProps {
  venue: ManagedVenue;
  onEdit: (venueId: number) => void;
  onArchive: (venueId: number) => void;
}

export const ManagedVenueCard: FC<ManagedVenueCardProps> = ({ venue, onEdit, onArchive }) => {
  const edit = (): void => {
    onEdit(venue.venueId);
  };

  const archive = (): void => {
    onArchive(venue.venueId);
  };

  const actions = (
    <>
      <KkButton size="small" variant="outlined" onClick={edit}>
        {EDIT_LABEL}
      </KkButton>
      <KkButton size="small" variant="text" tone="danger" onClick={archive}>
        {ARCHIVE_LABEL}
      </KkButton>
    </>
  );

  return (
    <VenueRecord
      name={venue.name}
      addressLine={toVenueAddressLine(venue)}
      hint={venue.hint}
      note={null}
      dimmed={false}
      actions={actions}
    />
  );
};
