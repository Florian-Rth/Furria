import { KkConfirmDialog } from '@furria/ui';
import type { FC } from 'react';
import { toDeleteConsequence, toEntryFacts } from '../calendar-labels';
import type { CalendarEntryRemovalControl } from '../hooks/use-calendar-entry-removal';
import type { CalendarEntry } from '../schemas';

const EYEBROW = 'Kalender';
const EXPLANATION = 'Termine werden endgültig gelöscht, nicht archiviert.';
const CONFIRM_LABEL = 'Löschen';
const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';

const toQuestion = (title: string): string => `„${title}“ aus dem Kalender löschen?`;

interface DeleteCalendarEntryDialogProps {
  entry: CalendarEntry;
  control: CalendarEntryRemovalControl;
}

export const DeleteCalendarEntryDialog: FC<DeleteCalendarEntryDialogProps> = ({
  entry,
  control,
}) => (
  <KkConfirmDialog
    open={control.isOpen}
    onClose={control.close}
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
