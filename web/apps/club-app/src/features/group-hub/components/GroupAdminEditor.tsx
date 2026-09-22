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
import { PersonPicker } from './PersonPicker';

const CHAIN_TITLE = 'Bisherige Ernennungen';
const APPOINT_NOTE = 'Kein Mitglied — geht trotzdem.';
const FUNCTION_LABEL = 'Funktion';
const FUNCTION_PLACEHOLDER = 'Trainerin, Sprecher, …';
const FUNCTION_HINT =
  'Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle, nicht am Wort.';
const FUNCTION_MAX = 64;
const SINCE_LABEL = 'Admin ab';
const SINCE_HINT = 'Darf in der Zukunft liegen. Vorher darf die Person die Gruppe nicht pflegen.';
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
          maxLength={FUNCTION_MAX}
        />
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          quickChoices={toJoinQuickChoices(today)}
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
          tone: admin === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};
