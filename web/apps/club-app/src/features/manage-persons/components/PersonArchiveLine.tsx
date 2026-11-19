import { KkConfirmDialog } from '@furria/ui/KkConfirmDialog';
import { KkDateField } from '@furria/ui/KkDateField';
import { KkWriteScreen } from '@furria/ui/KkWriteScreen';
import type { FC } from 'react';
import { usePersonArchiveDialog } from '../hooks/use-person-archive-dialog';
import {
  ARCHIVE_CONFIRM_LABEL,
  ARCHIVE_EXPLANATION,
  ARCHIVE_EYEBROW,
  ARCHIVE_PERSON_LABEL,
  LAST_DAY_LABEL,
} from '../person-archive';
import type { PersonDetails } from '../schemas';

const CANCEL_LABEL = 'Abbrechen';
const CLOSE_LABEL = 'Schließen';
const LAST_DAY_FIELD = 'lastDay';

interface PersonArchiveLineProps {
  person: PersonDetails;
}

export const PersonArchiveLine: FC<PersonArchiveLineProps> = ({ person }) => {
  const dialog = usePersonArchiveDialog(person);
  const field = dialog.lastDayField;
  const isConfirmBlocked = !dialog.canConfirm;

  const lastDayField =
    field === null ? undefined : (
      <KkDateField
        name={LAST_DAY_FIELD}
        label={LAST_DAY_LABEL}
        value={field.value}
        onChange={dialog.changeLastDay}
        minDay={field.minDay}
        maxDay={field.maxDay}
        required
        error={field.isRefused}
        helperText={field.helperText}
      />
    );

  return (
    <>
      <KkWriteScreen.Danger label={ARCHIVE_PERSON_LABEL} onSelect={dialog.open} />
      <KkConfirmDialog
        open={dialog.isOpen}
        onClose={dialog.close}
        onConfirm={dialog.submit}
        tone="danger"
        eyebrow={ARCHIVE_EYEBROW}
        question={dialog.question}
        explanation={ARCHIVE_EXPLANATION}
        fields={lastDayField}
        facts={dialog.facts}
        consequence={dialog.consequence}
        error={dialog.rejection}
        confirmLabel={ARCHIVE_CONFIRM_LABEL}
        confirmDisabled={isConfirmBlocked}
        cancelLabel={CANCEL_LABEL}
        closeLabel={CLOSE_LABEL}
        busy={dialog.isSaving}
      />
    </>
  );
};
