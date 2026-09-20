import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toDeleteConsequence, toEntryFacts } from '../calendar-labels';
import { useCalendarEntryRemoval } from '../hooks/use-calendar-entry-removal';
import type { CalendarEntry } from '../schemas';

const EYEBROW = 'Kalender';
const EXPLANATION =
  'Ein Termin wird gelöscht, nicht archiviert — im Kalender steht, was ansteht, nicht was einmal anstand.';
const CONFIRM_LABEL = 'Löschen';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

const toQuestion = (title: string): string => `„${title}“ aus dem Kalender löschen?`;

interface DeleteCalendarEntryDialogProps {
  entry: CalendarEntry | null;
  open: boolean;
  onClose: () => void;
}

export const DeleteCalendarEntryDialog: FC<DeleteCalendarEntryDialogProps> = ({
  entry,
  open,
  onClose,
}) => {
  const control = useCalendarEntryRemoval({ entry, open, onDone: onClose });

  if (entry === null) {
    return null;
  }

  return (
    <KkConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={control.submit}
      tone="danger"
      eyebrow={EYEBROW}
      question={toQuestion(entry.title)}
      explanation={EXPLANATION}
      facts={toEntryFacts(entry)}
      consequence={toDeleteConsequence(entry)}
      error={control.rejection ?? undefined}
      confirmLabel={CONFIRM_LABEL}
      cancelLabel={CANCEL_LABEL}
      closeLabel={CLOSE_LABEL}
      busy={control.isSaving}
    />
  );
};
