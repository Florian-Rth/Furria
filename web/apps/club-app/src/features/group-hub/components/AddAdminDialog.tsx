import {
  KkAlert,
  KkButton,
  KkChipField,
  KkConsequenceNote,
  KkDateField,
  KkModalFrame,
  KkNote,
} from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { ADMIN_FUNCTION_SUGGESTIONS, toJoinQuickChoices } from '../group-hub-labels';
import { useAddAdminForm } from '../hooks/use-add-admin-form';
import { PersonPicker } from './PersonPicker';

const TITLE = 'Gruppen-Admin ernennen';
const EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const PICKER_NOTE = 'Kein Mitglied — geht trotzdem.';
const FUNCTION_LABEL = 'Funktion';
const FUNCTION_PLACEHOLDER = 'Trainerin, Sprecher, …';
const FUNCTION_HINT =
  'Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle, nicht am Wort.';
const FUNCTION_MAX = 64;
const DATE_LABEL = 'Admin ab';
const DATE_HINT = 'Darf in der Zukunft liegen. Vorher darf die Person die Gruppe nicht pflegen.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Ernennen';

interface AddAdminDialogProps {
  groupId: number;
  groupName: string;
  open: boolean;
  onClose: () => void;
  onAppointed: (personId: number) => void;
}

export const AddAdminDialog: FC<AddAdminDialogProps> = ({
  groupId,
  groupName,
  open,
  onClose,
  onAppointed,
}) => {
  const titleId = useId();
  const form = useAddAdminForm({ groupId, open, onAppointed });
  const quickChoices = toJoinQuickChoices(new Date());

  const consequence =
    form.consequence === null ? null : <KkConsequenceNote>{form.consequence}</KkConsequenceNote>;

  const rejection =
    form.rejection === null ? null : <KkAlert severity="error">{form.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{groupName}</KkModalFrame.Kicker>
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
        <KkChipField
          name="function"
          label={FUNCTION_LABEL}
          value={form.functionLabel}
          onChange={form.setFunctionLabel}
          suggestions={ADMIN_FUNCTION_SUGGESTIONS}
          placeholder={FUNCTION_PLACEHOLDER}
          hint={FUNCTION_HINT}
          maxLength={FUNCTION_MAX}
        />
        <KkDateField
          name="sinceOn"
          label={DATE_LABEL}
          value={form.sinceOn}
          onChange={form.setSinceOn}
          quickChoices={quickChoices}
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
