import { KkButton, KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useVenueRestore } from '../hooks/use-venue-restore';
import {
  RESTORE_EXPLANATION,
  RESTORE_EYEBROW,
  toArchivedSinceLine,
  toRestoreConsequence,
  toRestoreQuestion,
  toVenueAddressLine,
  toVenueFacts,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';
import { VenueRecord } from './VenueRecord';

const RESTORE_LABEL = 'Aktivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface ArchivedVenueCardProps {
  venue: ManagedVenue;
}

export const ArchivedVenueCard: FC<ArchivedVenueCardProps> = ({ venue }) => {
  const restore = useVenueRestore(venue);
  const today = formatIsoDay(toIsoDay(new Date()));
  const note = venue.archivedOn === null ? null : toArchivedSinceLine(venue.archivedOn);

  const actions = (
    <KkButton size="small" variant="outlined" onClick={restore.open}>
      {RESTORE_LABEL}
    </KkButton>
  );

  return (
    <>
      <VenueRecord
        name={venue.name}
        addressLine={toVenueAddressLine(venue)}
        hint={venue.hint}
        note={note}
        dimmed
        actions={actions}
      />
      <KkConfirmDialog
        open={restore.isOpen}
        onClose={restore.close}
        onConfirm={restore.submit}
        eyebrow={RESTORE_EYEBROW}
        question={toRestoreQuestion(venue.name)}
        explanation={RESTORE_EXPLANATION}
        facts={toVenueFacts(venue, today)}
        consequence={toRestoreConsequence(venue.name, today)}
        error={restore.rejection ?? undefined}
        confirmLabel={RESTORE_LABEL}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={restore.isSaving}
      />
    </>
  );
};
