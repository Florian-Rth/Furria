import {
  KkAlert,
  KkButton,
  KkChipField,
  KkConsequenceNote,
  KkDateField,
  KkModalFrame,
  KkNote,
  KkSwitchRow,
} from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import { ADMIN_FUNCTION_SUGGESTIONS, toJoinQuickChoices } from '../group-hub-labels';
import { useAddMemberForm } from '../hooks/use-add-member-form';
import { PersonPicker } from './PersonPicker';

const TITLE = 'Mitglied aufnehmen';
const EXPLANATION =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const DATE_LABEL = 'Dabei ab';
const DATE_HINT =
  'Darf in der Zukunft liegen. Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Zugehörigkeit.';
const ADMIN_LABEL = 'Auch Gruppen-Admin';
const ADMIN_DESCRIPTION =
  'Gruppen-Admins pflegen die Gruppe: Beschreibung ändern, Leute aufnehmen und beenden. Die Ernennung beginnt am selben Tag wie die Zugehörigkeit.';
const ADMIN_STATE_LABEL = { on: 'ja', off: 'nein' };
const FUNCTION_LABEL = 'Funktion';
const FUNCTION_PLACEHOLDER = 'Trainerin, Sprecher, …';
const FUNCTION_HINT =
  'Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle, nicht am Wort.';
const FUNCTION_MAX = 64;
const CLOSE_LABEL = 'Schließen';
const CANCEL_LABEL = 'Abbrechen';
const CONFIRM_LABEL = 'Aufnehmen';

interface AddMemberDialogProps {
  groupId: number;
  groupName: string;
  open: boolean;
  onClose: () => void;
  onAdded: (personId: number) => void;
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

  const functionField = form.makeAdmin ? (
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
  ) : null;

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
        <KkSwitchRow
          label={ADMIN_LABEL}
          description={ADMIN_DESCRIPTION}
          checked={form.makeAdmin}
          onChange={form.setMakeAdmin}
          stateLabel={ADMIN_STATE_LABEL}
        />
        {functionField}
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
