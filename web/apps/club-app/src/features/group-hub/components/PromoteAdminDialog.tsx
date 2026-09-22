import {
  KkAlert,
  KkButton,
  KkChipField,
  KkConsequenceNote,
  KkDateField,
  KkModalFrame,
} from '@furria/ui';
import type { FC } from 'react';
import { useId } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import { ADMIN_FUNCTION_SUGGESTIONS, toJoinQuickChoices } from '../group-hub-labels';
import { useAdminAppointment } from '../hooks/use-admin-appointment';

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

const toTitle = (personName: string): string => `${personName} zum Gruppen-Admin machen`;

interface PromoteAdminDialogProps {
  groupId: number;
  groupName: string;
  member: GroupDetailMember | null;
  onClose: () => void;
  onAppointed: () => void;
}

export const PromoteAdminDialog: FC<PromoteAdminDialogProps> = ({
  groupId,
  groupName,
  member,
  onClose,
  onAppointed,
}) => {
  const titleId = useId();
  const open = member !== null;
  const form = useAdminAppointment({ groupId, person: member, open, onAppointed });
  const quickChoices = toJoinQuickChoices(new Date());

  if (member === null) {
    return null;
  }

  const consequence =
    form.consequence === null ? null : <KkConsequenceNote>{form.consequence}</KkConsequenceNote>;

  const rejection =
    form.rejection === null ? null : <KkAlert severity="error">{form.rejection}</KkAlert>;

  return (
    <KkModalFrame open={open} onClose={onClose} labelledBy={titleId} closeLabel={CLOSE_LABEL}>
      <KkModalFrame.Kicker>{groupName}</KkModalFrame.Kicker>
      <KkModalFrame.Title id={titleId}>
        {toTitle(`${member.firstName} ${member.lastName}`)}
      </KkModalFrame.Title>
      <KkModalFrame.Fields>
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
