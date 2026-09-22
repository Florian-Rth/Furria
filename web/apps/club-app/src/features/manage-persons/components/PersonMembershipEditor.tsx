import type { KkPanelAction } from '@furria/ui';
import { KkDateField, KkFactRow, KkNote, KkPanel, KkPanelSection, KkWriteScreen } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey, useLanding, WriteScreen } from '@/features/write';
import { usePersonMembershipEditor } from '../hooks/use-person-membership-editor';
import {
  ADD_PAUSE_ACTION_LABEL,
  MEMBERSHIP_CHAIN_TITLE,
  MEMBERSHIP_PAUSES_TITLE,
  NO_PAUSES_NOTE,
  toMembershipChainRows,
  toMembershipEndQuickChoices,
  toMembershipQuickChoices,
  toPersonOrigin,
} from '../manage-persons-labels';
import type { PersonDetails, PersonMembership } from '../schemas';
import { PersonPauseRow } from './PersonPauseRow';

const START_LABEL = 'Mitglied ab';
const START_HINT =
  'Ein Wiedereintritt beginnt frühestens am Tag nach dem Ende der vorigen Mitgliedschaft.';
const END_LABEL = 'Mitglied bis';
const END_HINT = 'Leer lassen, solange die Mitgliedschaft läuft. Dieser Tag zählt noch dazu.';
const END_EMPTY_LABEL = 'Offen lassen';
const ADD_PAUSE_LABEL = 'Ruhezeit';
const PAUSE_NEW_ROUTE = '/manage/persons/$personId/pauses/new';

interface PersonMembershipEditorProps {
  person: PersonDetails;
  membership: PersonMembership | null;
}

export const PersonMembershipEditor: FC<PersonMembershipEditorProps> = ({ person, membership }) => {
  const control = usePersonMembershipEditor({ person, membership });
  const { highlightedKey } = useLanding();
  const navigate = useNavigate();
  const today = new Date();

  const chainRows = toMembershipChainRows(person, membership?.membershipId ?? null);
  const chain =
    chainRows.length === 0 ? null : (
      <KkWriteScreen.Chain title={MEMBERSHIP_CHAIN_TITLE}>
        {chainRows.map((row) => (
          <KkFactRow key={row.key} title={row.span} span="" highlight={row.isEdited} />
        ))}
      </KkWriteScreen.Chain>
    );

  const startPause = (): void => {
    if (membership === null) {
      return;
    }

    void navigate({
      to: PAUSE_NEW_ROUTE,
      params: { personId: String(person.personId) },
      search: { membership: String(membership.membershipId) },
    });
  };

  const pausesAction: KkPanelAction = {
    label: ADD_PAUSE_LABEL,
    icon: 'add',
    ariaLabel: ADD_PAUSE_ACTION_LABEL,
    onClick: startPause,
  };

  const pausesBody =
    membership === null || membership.pauses.length === 0 ? (
      <KkNote tone="muted">{NO_PAUSES_NOTE}</KkNote>
    ) : (
      <KkPanel variant="list">
        {membership.pauses.map((pause) => (
          <PersonPauseRow
            key={pause.pauseId}
            personId={person.personId}
            pause={pause}
            highlight={highlightedKey === toLandingKey('pause', pause.pauseId)}
          />
        ))}
      </KkPanel>
    );

  const pausesSection =
    membership === null ? null : (
      <KkPanelSection title={MEMBERSHIP_PAUSES_TITLE} action={pausesAction}>
        {pausesBody}
      </KkPanelSection>
    );

  return (
    <WriteScreen
      origin={toPersonOrigin(person)}
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
          tone: control.actionTone,
        },
      }}
    >
      {chain}
      <KkDateField
        name="startedOn"
        label={START_LABEL}
        value={control.startedOn}
        onChange={control.setStartedOn}
        quickChoices={toMembershipQuickChoices(today)}
        hint={START_HINT}
      />
      <KkDateField
        name="endedOn"
        label={END_LABEL}
        value={control.endedOn}
        onChange={control.setEndedOn}
        quickChoices={toMembershipEndQuickChoices(today)}
        allowEmpty
        emptyLabel={END_EMPTY_LABEL}
        hint={END_HINT}
      />
      {pausesSection}
    </WriteScreen>
  );
};
