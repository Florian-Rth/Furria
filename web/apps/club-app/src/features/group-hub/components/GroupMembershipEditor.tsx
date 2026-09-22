import {
  KkChipField,
  KkDateField,
  KkFactRow,
  KkNote,
  KkSwitchRow,
  KkWriteScreen,
} from '@furria/ui';
import type { FC } from 'react';
import type { GroupDetailMember } from '@/features/group-detail';
import { WriteScreen } from '@/features/write';
import {
  ADMIN_FUNCTION_SUGGESTIONS,
  toEndQuickChoices,
  toHubEditorOrigin,
  toJoinQuickChoices,
  toMembershipChainRows,
} from '../group-hub-labels';
import { useGroupMembershipEditor } from '../hooks/use-group-membership-editor';
import { toHubPeople, toPrefillPerson } from '../hub-people';
import type { GroupHub } from '../schemas';
import { PersonPicker } from './PersonPicker';

const CHAIN_TITLE = 'Bisherige Zeiträume';
const JOIN_NOTE =
  'Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden.';
const JOIN_DATE_LABEL = 'Dabei ab';
const JOIN_DATE_HINT =
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
const END_DATE_LABEL = 'Letzter Tag';
const END_DATE_HINT = 'Dieser Tag zählt noch dazu.';

interface GroupMembershipEditorProps {
  hub: GroupHub;
  membership: GroupDetailMember | null;
  prefillPersonId: number | null;
}

export const GroupMembershipEditor: FC<GroupMembershipEditorProps> = ({
  hub,
  membership,
  prefillPersonId,
}) => {
  const people = toHubPeople(hub.members, hub.admins);
  const prefillPerson = toPrefillPerson(people, prefillPersonId);
  const control = useGroupMembershipEditor({ groupId: hub.groupId, membership, prefillPerson });
  const today = new Date();

  const chainPersonId =
    membership !== null ? membership.personId : (control.person?.personId ?? null);
  const chainRows =
    chainPersonId === null
      ? []
      : toMembershipChainRows(hub, chainPersonId, membership?.groupMembershipId ?? null);

  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const functionField = control.makeAdmin ? (
    <KkChipField
      name="function"
      label={FUNCTION_LABEL}
      value={control.functionLabel}
      onChange={control.setFunctionLabel}
      suggestions={ADMIN_FUNCTION_SUGGESTIONS}
      placeholder={FUNCTION_PLACEHOLDER}
      hint={FUNCTION_HINT}
      maxLength={FUNCTION_MAX}
    />
  ) : null;

  const fields =
    membership === null ? (
      <>
        <KkNote>{JOIN_NOTE}</KkNote>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
        />
        {chain}
        <KkDateField
          name="joinedOn"
          label={JOIN_DATE_LABEL}
          value={control.joinedOn}
          onChange={control.setJoinedOn}
          quickChoices={toJoinQuickChoices(today)}
          hint={JOIN_DATE_HINT}
        />
        <KkSwitchRow
          label={ADMIN_LABEL}
          description={ADMIN_DESCRIPTION}
          checked={control.makeAdmin}
          onChange={control.setMakeAdmin}
          stateLabel={ADMIN_STATE_LABEL}
        />
        {functionField}
      </>
    ) : (
      <>
        {chain}
        <KkDateField
          name="endedOn"
          label={END_DATE_LABEL}
          value={control.endedOn}
          onChange={control.setEndedOn}
          quickChoices={toEndQuickChoices(today)}
          hint={END_DATE_HINT}
        />
      </>
    );

  return (
    <WriteScreen
      origin={toHubEditorOrigin(hub)}
      title={control.actionLabel}
      rejection={control.rejection ?? undefined}
      isDirty={control.isDirty}
      action={{
        context:
          control.consequence === null
            ? undefined
            : { text: control.consequence, tone: 'consequence' },
        primary: {
          label: control.actionLabel,
          onSelect: control.submit,
          loading: control.isSaving,
          tone: membership === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};
