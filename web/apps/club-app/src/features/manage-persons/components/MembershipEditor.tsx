import { KkDateField } from '@furria/ui';
import type { FC } from 'react';
import { useMembershipEditor } from '../hooks/use-membership-editor';
import { toMembershipEndQuickChoices, toMembershipQuickChoices } from '../manage-persons-labels';
import type { PersonMembership } from '../schemas';
import { FactEditorFrame } from './FactEditorFrame';

const ADD_TITLE = 'Zeitraum hinzufügen';
const EDIT_TITLE = 'Zeitraum ändern';
const ADD_CONFIRM_LABEL = 'Hinzufügen';
const EDIT_CONFIRM_LABEL = 'Ändern';
const START_LABEL = 'Mitglied ab';
const START_HINT =
  'Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft.';
const END_LABEL = 'Mitglied bis';
const END_HINT = 'Leer lassen, solange die Mitgliedschaft läuft. Dieser Tag zählt noch dazu.';
const END_EMPTY_LABEL = 'Offen lassen';

interface MembershipEditorProps {
  personId: number;
  membership: PersonMembership | null;
  onClose: () => void;
  onSaved: () => void;
}

export const MembershipEditor: FC<MembershipEditorProps> = ({
  personId,
  membership,
  onClose,
  onSaved,
}) => {
  const control = useMembershipEditor({ personId, membership, onSaved });
  const isEdit = membership !== null;
  const today = new Date();
  const startChoices = toMembershipQuickChoices(today);
  const endChoices = toMembershipEndQuickChoices(today);

  return (
    <FactEditorFrame
      title={isEdit ? EDIT_TITLE : ADD_TITLE}
      consequence={control.consequence}
      rejection={control.rejection}
      confirmLabel={isEdit ? EDIT_CONFIRM_LABEL : ADD_CONFIRM_LABEL}
      isSaving={control.isSaving}
      canSubmit={control.canSubmit}
      onCancel={onClose}
      onSubmit={control.submit}
    >
      <KkDateField
        name="startedOn"
        label={START_LABEL}
        value={control.startedOn}
        onChange={control.setStartedOn}
        quickChoices={startChoices}
        hint={START_HINT}
      />
      <KkDateField
        name="endedOn"
        label={END_LABEL}
        value={control.endedOn}
        onChange={control.setEndedOn}
        quickChoices={endChoices}
        allowEmpty
        emptyLabel={END_EMPTY_LABEL}
        hint={END_HINT}
      />
    </FactEditorFrame>
  );
};
