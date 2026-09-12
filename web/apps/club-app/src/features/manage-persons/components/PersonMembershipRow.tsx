import { KkButton, KkChip, KkFactRow, KkIcon } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { toPeriodChip } from '@/lib/state-chips';
import type { FactEditor } from '../hooks/use-fact-editor';
import {
  ADD_PAUSE_ACTION_LABEL,
  END_MEMBERSHIP_CONFIRM_LABEL,
  MEMBERSHIP_ROW_TITLE,
  toMembershipEditActionLabel,
  toMembershipSpan,
} from '../manage-persons-labels';
import type { PersonMembership } from '../schemas';
import { MembershipEditor } from './MembershipEditor';
import { PersonPauseRow } from './PersonPauseRow';

const EDIT_LABEL = 'Ändern';
const END_LABEL = 'Beenden';
const ADD_PAUSE_LABEL = 'Ruhezeit';

interface PersonMembershipRowProps {
  personId: number;
  firstName: string;
  membership: PersonMembership;
  editor: FactEditor;
}

export const PersonMembershipRow: FC<PersonMembershipRowProps> = ({
  personId,
  firstName,
  membership,
  editor,
}) => {
  const { membershipId } = membership;
  const isEditing = editor.membership?.membershipId === membershipId;

  const startEdit = (): void => {
    editor.openMembership(membershipId);
  };

  const startEnd = (): void => {
    editor.openEndMembership(membershipId);
  };

  const startAddPause = (): void => {
    editor.openPause(membershipId, null);
  };

  if (isEditing) {
    return (
      <MembershipEditor
        personId={personId}
        membership={membership}
        onClose={editor.close}
        onSaved={editor.close}
      />
    );
  }

  const span = toMembershipSpan(membership);
  const periodChip = toPeriodChip(membership.isRunning, membership.isFuture);

  const chip =
    periodChip === null ? undefined : (
      <KkChip tone={periodChip.tone} dot={periodChip.dot} size="small">
        {periodChip.label}
      </KkChip>
    );

  const endButton = membership.isRunning ? (
    <KkButton
      size="small"
      variant="text"
      tone="danger"
      ariaLabel={END_MEMBERSHIP_CONFIRM_LABEL}
      onClick={startEnd}
    >
      {END_LABEL}
    </KkButton>
  ) : null;

  const actions = (
    <>
      <KkButton
        size="small"
        variant="text"
        ariaLabel={toMembershipEditActionLabel(membership)}
        onClick={startEdit}
      >
        {EDIT_LABEL}
      </KkButton>
      {endButton}
    </>
  );

  const isAddingPause =
    editor.pause !== null &&
    editor.pause.membershipId === membershipId &&
    editor.pause.pauseId === null;

  const pauseRows = membership.pauses.map((pause) => (
    <PersonPauseRow
      key={pause.pauseId}
      personId={personId}
      membershipId={membershipId}
      firstName={firstName}
      pause={pause}
      editor={editor}
    />
  ));

  const addPauseSlot = isAddingPause ? (
    <PersonPauseRow
      personId={personId}
      membershipId={membershipId}
      firstName={firstName}
      pause={null}
      editor={editor}
    />
  ) : (
    <Stack direction="row" sx={{ minWidth: 0, pt: 0.75 }}>
      <KkButton
        size="small"
        variant="text"
        startIcon={<KkIcon name="add" size="small" />}
        ariaLabel={ADD_PAUSE_ACTION_LABEL}
        onClick={startAddPause}
      >
        {ADD_PAUSE_LABEL}
      </KkButton>
    </Stack>
  );

  return (
    <KkFactRow title={MEMBERSHIP_ROW_TITLE} span={span} chip={chip} actions={actions}>
      {pauseRows}
      {addPauseSlot}
    </KkFactRow>
  );
};
