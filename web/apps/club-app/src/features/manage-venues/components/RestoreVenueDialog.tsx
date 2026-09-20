import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';
import { useRestoreVenueMutation } from '../api';
import { useVenueConfirm } from '../hooks/use-venue-confirm';
import {
  RESTORE_EXPLANATION,
  RESTORE_EYEBROW,
  toRestoreConsequence,
  toRestoreQuestion,
  toVenueFacts,
} from '../manage-venues-labels';
import type { ManagedVenue } from '../schemas';

const CONFIRM_LABEL = 'Aktivieren';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

interface RestoreVenueDialogProps {
  venue: ManagedVenue | null;
  open: boolean;
  onClose: () => void;
}

export const RestoreVenueDialog: FC<RestoreVenueDialogProps> = ({ venue, open, onClose }) => {
  const mutation = useRestoreVenueMutation();
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
      eyebrow={RESTORE_EYEBROW}
      question={toRestoreQuestion(venue.name)}
      explanation={RESTORE_EXPLANATION}
      facts={toVenueFacts(venue, today)}
      consequence={toRestoreConsequence(venue.name, today)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
