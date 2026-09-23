import { KkFactRow, KkNote, KkSessionField, KkWriteScreen } from '@furria/ui';
import type { FC } from 'react';
import { WriteScreen } from '@/features/write';
import { usePersonPauseEditor } from '../hooks/use-person-pause-editor';
import {
  PAUSE_CHAIN_TITLE,
  toContainingMembershipNote,
  toMembershipOrigin,
  toMembershipSpan,
  toPauseChainRows,
} from '../manage-persons-labels';
import type { PersonDetails, PersonMembership, PersonPause } from '../schemas';

const FIRST_LABEL = 'Von Session';
const FIRST_HINT = 'Eine Ruhezeit zählt in ganzen Sessions, nie in Tagen.';
const LAST_LABEL = 'Bis Session';
const LAST_HINT = 'Offen lassen, solange das Ende noch nicht feststeht.';
const OPEN_LABEL = 'offen lassen';

interface PersonPauseEditorProps {
  person: PersonDetails;
  membership: PersonMembership;
  pause: PersonPause | null;
}

export const PersonPauseEditor: FC<PersonPauseEditorProps> = ({ person, membership, pause }) => {
  const control = usePersonPauseEditor({
    personId: person.personId,
    firstName: person.firstName,
    membership,
    pause,
  });

  const chainRows = toPauseChainRows(membership, pause?.pauseId ?? null);
  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={PAUSE_CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  return (
    <WriteScreen
      origin={toMembershipOrigin(person, membership)}
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
        },
      }}
    >
      <KkNote>{toContainingMembershipNote(toMembershipSpan(membership))}</KkNote>
      {chain}
      <KkSessionField
        name="firstSessionYear"
        label={FIRST_LABEL}
        value={control.firstSessionYear}
        onChange={control.setFirstSessionYear}
        currentSessionYear={control.currentSessionYear}
        required
        error={control.firstSessionYearError !== undefined}
        helperText={control.firstSessionYearError}
        hint={FIRST_HINT}
      />
      <KkSessionField
        name="lastSessionYear"
        label={LAST_LABEL}
        value={control.lastSessionYear}
        onChange={control.setLastSessionYear}
        currentSessionYear={control.currentSessionYear}
        allowOpen
        openLabel={OPEN_LABEL}
        hint={LAST_HINT}
      />
    </WriteScreen>
  );
};
