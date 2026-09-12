import { KkButton, KkFactRow } from '@furria/ui';
import type { FC } from 'react';
import type { FactEditor } from '../hooks/use-fact-editor';
import { PAUSE_ROW_TITLE, toPauseSpan } from '../manage-persons-labels';
import type { PersonPause } from '../schemas';
import { PauseEditor } from './PauseEditor';

const EDIT_LABEL = 'Ändern';

interface PersonPauseRowProps {
  personId: number;
  membershipId: number;
  firstName: string;
  pause: PersonPause | null;
  editor: FactEditor;
}

export const PersonPauseRow: FC<PersonPauseRowProps> = ({
  personId,
  membershipId,
  firstName,
  pause,
  editor,
}) => {
  const isEditing =
    editor.pause !== null &&
    editor.pause.membershipId === membershipId &&
    editor.pause.pauseId === (pause?.pauseId ?? null);

  const startEdit = (): void => {
    editor.openPause(membershipId, pause?.pauseId ?? null);
  };

  if (isEditing) {
    return (
      <PauseEditor
        personId={personId}
        membershipId={membershipId}
        firstName={firstName}
        pause={pause}
        onClose={editor.close}
        onSaved={editor.close}
      />
    );
  }

  if (pause === null) {
    return null;
  }

  const actions = (
    <KkButton size="small" variant="outlined" onClick={startEdit}>
      {EDIT_LABEL}
    </KkButton>
  );

  return (
    <KkFactRow title={PAUSE_ROW_TITLE} span={toPauseSpan(pause)} tone="gold" actions={actions} />
  );
};
