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
import { ADMIN_FUNCTION_MAX_LENGTH } from '../schemas';
import { PersonPicker } from './PersonPicker';

const CHAIN_TITLE = 'Bisherige Zeiträume';
const JOIN_NOTE = 'Neue Personen werden in der Personenverwaltung angelegt.';
const JOIN_DATE_LABEL = 'Dabei ab';
const JOIN_DATE_HINT =
  'Ein Wiedereintritt ist frühestens am Tag nach dem Ende der vorherigen Zugehörigkeit möglich.';
const ADMIN_LABEL = 'Auch Gruppen-Admin';
const ADMIN_DESCRIPTION =
  'Gruppen-Admins verwalten Beschreibung und Zugehörigkeiten. Die Ernennung gilt ab Beginn der Zugehörigkeit.';
const ADMIN_STATE_LABEL = { on: 'ja', off: 'nein' };
const FUNCTION_LABEL = 'Funktion';
const FUNCTION_PLACEHOLDER = 'Optional';
const FUNCTION_HINT = 'Dient nur der Anzeige und hat keinen Einfluss auf Rechte.';
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
      maxLength={ADMIN_FUNCTION_MAX_LENGTH}
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
          required
          error={control.joinedOnError !== undefined}
          helperText={control.joinedOnError}
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
          required
          error={control.endedOnError !== undefined}
          helperText={control.endedOnError}
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
          disabled: !control.canSubmit,
          tone: membership === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};
