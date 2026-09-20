import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useArchiveVenueMutation } from '../api';
import { useVenueConfirm } from '../hooks/use-venue-confirm';
import {
  ARCHIVE_EXPLANATION,
  ARCHIVE_EYEBROW,
  toArchiveConsequence,
  toArchiveQuestion,
  toVenueFacts,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';

const CONFIRM_LABEL = 'Archivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface ArchiveVenueDialogProps {
  venue: ManagedVenue | null;
  open: boolean;
  onClose: () => void;
}

export const ArchiveVenueDialog: FC<ArchiveVenueDialogProps> = ({ venue, open, onClose }) => {
  const mutation = useArchiveVenueMutation();
  const control = useVenueConfirm({ mutation, venue, open, onDone: onClose });

  if (venue === null) {
    return null;
  }

  const today = formatIsoDay(toIsoDay(new Date()));

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      eyebrow={ARCHIVE_EYEBROW}
      question={toArchiveQuestion(venue.name)}
      explanation={ARCHIVE_EXPLANATION}
      facts={toVenueFacts(venue, today)}
      consequence={toArchiveConsequence(venue.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
