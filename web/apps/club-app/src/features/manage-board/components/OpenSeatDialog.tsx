import {
  KkAlert,
  KkButton,
  KkConsequenceNote,
  KkDateField,
  KkModalFrame,
  KkNote,
} from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { useOpenSeatForm } from '../hooks/use-open-seat-form';
import type { BoardOfficeEntry } from '../manage-board-labels';

const TITLE = 'Vorstandssitz eintragen';
const EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const PICKER_NOTE = 'Kein Mitglied — geht trotzdem.';
const DATE_LABEL = 'Im Vorstand ab';
const DATE_HINT = 'Der Tag der Wahl. Darf in der Zukunft liegen.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Eintragen';

interface OpenSeatDialogProps {
  office: BoardOfficeEntry | null;
  onClose: () => void;
}

export const OpenSeatDialog: FC<OpenSeatDialogProps> = ({ office, onClose }) => {
  const titleId = useId();
  const open = office !== null;
  const form = useOpenSeatForm({
    boardOfficeId: office?.boardOfficeId ?? 0,
    officeName: office?.name ?? '',
    impliedRoleName: office?.impliedRoleName ?? null,
    open,
    onOpened: onClose,
  });

  if (office === null) {
    return null;
  }

  const consequence =
    form.consequence === null ? null : <KkConsequenceNote>{form.consequence}</KkConsequenceNote>;

  const rejection =
    form.rejection === null ? null : <KkAlert severity="error">{form.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{office.name}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>{TITLE}</KkModalFrame.Title>
      <KkModalFrame.Body>
        <KkNote>{EXPLANATION}</KkNote>
      </KkModalFrame.Body>
      <KkModalFrame.Fields>
        <PersonPicker
          selected={form.person}
          onSelect={form.select}
          onClear={form.clearPerson}
          note={PICKER_NOTE}
        />
        <KkDateField
          name="sinceOn"
          label={DATE_LABEL}
          value={form.sinceOn}
          onChange={form.setSinceOn}
          hint={DATE_HINT}
        />
        {consequence}
      </KkModalFrame.Fields>
      <KkModalFrame.Footer>
        {rejection}
        <KkButton variant="outlined" onClick={onClose} disabled={form.isSaving}>
          {CANCEL_LABEL}
        </KkButton>
        <KkButton onClick={form.submit} loading={form.isSaving} disabled={!form.canSubmit}>
          {CONFIRM_LABEL}
        </KkButton>
      </KkModalFrame.Footer>
    </KkModalFrame>
  );
};
