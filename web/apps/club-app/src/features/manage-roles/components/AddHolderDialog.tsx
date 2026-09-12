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
import { useAddHolderForm } from '../hooks/use-add-holder-form';
import { toStartQuickChoices } from '../manage-roles-labels';

const TITLE = 'Inhaberschaft eintragen';
const EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const PICKER_NOTE = 'Kein Mitglied — geht trotzdem.';
const DATE_LABEL = 'Inne ab';
const DATE_HINT =
  'Darf in der Zukunft liegen. Die Rechte der Rolle greifen ab diesem Tag, nicht vorher.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Eintragen';

interface AddHolderDialogProps {
  roleId: number;
  roleName: string;
  open: boolean;
  onClose: () => void;
}

export const AddHolderDialog: FC<AddHolderDialogProps> = ({ roleId, roleName, open, onClose }) => {
  const titleId = useId();
  const form = useAddHolderForm({ roleId, roleName, open, onAdded: onClose });
  const quickChoices = toStartQuickChoices(new Date());

  const consequence =
    form.consequence === null ? null : <KkConsequenceNote>{form.consequence}</KkConsequenceNote>;

  const rejection =
    form.rejection === null ? null : <KkAlert severity="error">{form.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{roleName}</KkModalFrame.Kicker>
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
