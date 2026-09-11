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
import { toJoinQuickChoices } from '../group-hub-labels';
import { useAddMemberForm } from '../hooks/use-add-member-form';
import { PersonPicker } from './PersonPicker';

const TITLE = 'Mitglied aufnehmen';
const EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const DATE_LABEL = 'Dabei ab';
const DATE_HINT =
  'Darf in der Zukunft liegen. Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Zugehörigkeit.';
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Aufnehmen';

interface AddMemberDialogProps {
  groupId: number;
  groupName: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export const AddMemberDialog: FC<AddMemberDialogProps> = ({
  groupId,
  groupName,
  open,
  onClose,
  onAdded,
}) => {
  const titleId = useId();
  const form = useAddMemberForm({ groupId, open, onAdded });
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
        <PersonPicker selected={form.person} onSelect={form.select} onClear={form.clearPerson} />
        <KkDateField
          name="joinedOn"
          label={DATE_LABEL}
          value={form.joinedOn}
          onChange={form.setJoinedOn}
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
