import { KkDateField, KkFactRow, KkNote, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { PersonPicker } from '@/features/group-hub';
import { WriteScreen } from '@/features/write';
import { useRoleHoldingEditor } from '../hooks/use-role-holding-editor';
import {
  toEndQuickChoices,
  toRoleHoldingChainRows,
  toRoleOrigin,
  toStartQuickChoices,
} from '../manage-roles-labels';
import type { RoleDetails, RoleHolder } from '../schemas';

const CHAIN_TITLE = 'Bisherige Inhaberschaften';
const PICKER_NOTE = 'Auch ohne Mitgliedschaft möglich.';
const JOIN_EXPLANATION = 'Neue Personen werden in der Personenverwaltung angelegt.';
const SINCE_LABEL = 'Inne ab';
const SINCE_HINT = 'Die Rechte gelten ab diesem Tag. Auch ein Datum in der Zukunft ist möglich.';
const END_DATE_LABEL = 'Letzter Tag';
const END_DATE_HINT = 'Dieser Tag zählt noch dazu.';

interface RoleHoldingEditorProps {
  role: RoleDetails;
  holder: RoleHolder | null;
  prefillPersonId: number | null;
}

export const RoleHoldingEditor: FC<RoleHoldingEditorProps> = ({
  role,
  holder,
  prefillPersonId,
}) => {
  const prefillPerson =
    prefillPersonId === null
      ? null
      : (role.holders.find((entry) => entry.personId === prefillPersonId) ??
        role.pastHolders.find((entry) => entry.personId === prefillPersonId) ??
        null);
  const control = useRoleHoldingEditor({
    roleId: role.roleId,
    roleName: role.name,
    holder,
    prefillPerson,
  });
  const today = new Date();

  const chainPersonId = holder !== null ? holder.personId : (control.person?.personId ?? null);
  const chainRows =
    chainPersonId === null
      ? []
      : toRoleHoldingChainRows(role, chainPersonId, holder?.roleHoldingId ?? null);

  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const fields =
    holder === null ? (
      <>
        <KkNote>{JOIN_EXPLANATION}</KkNote>
        <PersonPicker
          selected={control.person}
          onSelect={control.select}
          onClear={control.clearPerson}
          note={PICKER_NOTE}
        />
        {chain}
        <KkDateField
          name="sinceOn"
          label={SINCE_LABEL}
          value={control.sinceOn}
          onChange={control.setSinceOn}
          quickChoices={toStartQuickChoices(today)}
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
      origin={toRoleOrigin(role)}
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
          tone: holder === null ? undefined : 'danger',
        },
      }}
    >
      {fields}
    </WriteScreen>
  );
};
