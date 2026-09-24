import { KkChipField, KkDateField, KkFactRow, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import type { GroupDetailAdmin } from '@/features/group-detail';
import { WriteScreen } from '@/features/write';
import {
  ADMIN_FUNCTION_SUGGESTIONS,
  toAdminChainRows,
  toEndQuickChoices,
  toHubEditorOrigin,
  toJoinQuickChoices,
} from '../group-hub-labels';
import { useGroupAdminEditor } from '../hooks/use-group-admin-editor';
import { toHubPeople, toPrefillPerson } from '../hub-people';
import type { GroupHub } from '../schemas';
import { ADMIN_FUNCTION_MAX_LENGTH } from '../schemas';
import { PersonPicker } from './PersonPicker';

const CHAIN_TITLE = 'Bisherige Ernennungen';
const APPOINT_NOTE = 'Auch ohne Mitgliedschaft möglich.';
const FUNCTION_LABEL = 'Funktion';
const FUNCTION_PLACEHOLDER = 'Optional';
const FUNCTION_HINT = 'Dient nur der Anzeige und hat keinen Einfluss auf Rechte.';
const SINCE_LABEL = 'Admin ab';
const SINCE_HINT = 'Auch ein Datum in der Zukunft ist möglich.';
const END_DATE_LABEL = 'Letzter Tag';
const END_DATE_HINT = 'Dieser Tag zählt noch dazu.';

interface GroupAdminEditorProps {
  hub: GroupHub;
  admin: GroupDetailAdmin | null;
  prefillPersonId: number | null;
}

export const GroupAdminEditor: FC<GroupAdminEditorProps> = ({ hub, admin, prefillPersonId }) => {
  const people = toHubPeople(hub.members, hub.admins);
  const prefillPerson = toPrefillPerson(people, prefillPersonId);
  const control = useGroupAdminEditor({
    groupId: hub.groupId,
    groupName: hub.name,
    admin,
    runningAdmins: hub.admins.length,
    prefillPerson,
  });
  const today = new Date();

  const chainPersonId = admin !== null ? admin.personId : (control.person?.personId ?? null);
  const chainRows =
    chainPersonId === null ? [] : toAdminChainRows(hub, chainPersonId, admin?.groupAdminId ?? null);

  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const fields =
    admin === null ? (
      <>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
          note={APPOINT_NOTE}
        />
        {chain}
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
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          quickChoices={toJoinQuickChoices(today)}
          required
          error={control.sinceOnError !== undefined}
          helperText={control.sinceOnError}
          hint={SINCE_HINT}
        />
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
          tone: admin === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};
