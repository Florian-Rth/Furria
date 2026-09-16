import { KkSessionField } from '@furria/ui';
import type { FC } from 'react';
import { usePauseEditor } from '../hooks/use-pause-editor';
import type { PersonPause } from '../schemas';
import { FactEditorFrame } from './FactEditorFrame';

const ADD_TITLE = 'Ruhezeit hinzufügen';
const EDIT_TITLE = 'Ruhezeit ändern';
const ADD_CONFIRM_LABEL = 'Hinzufügen';
const EDIT_CONFIRM_LABEL = 'Ändern';
const FIRST_LABEL = 'Von Session';
const FIRST_HINT = 'Eine Ruhezeit zählt in ganzen Sessions, nie in Tagen.';
const LAST_LABEL = 'Bis Session';
const LAST_HINT = 'Offen lassen, solange das Ende noch nicht feststeht.';
const OPEN_LABEL = 'offen lassen';

interface PauseEditorProps {
  personId: number;
  membershipId: number;
  firstName: string;
  pause: PersonPause | null;
  onClose: () => void;
  onSaved: () => void;
}

export const PauseEditor: FC<PauseEditorProps> = ({
  personId,
  membershipId,
  firstName,
  pause,
  onClose,
  onSaved,
}) => {
  const control = usePauseEditor({ personId, membershipId, pause, firstName, onSaved });
  const isEdit = pause !== null;

  return (
    <FactEditorFrame
      title={isEdit ? EDIT_TITLE : ADD_TITLE}
      consequence={control.consequence}
      rejection={control.rejection}
      confirmLabel={isEdit ? EDIT_CONFIRM_LABEL : ADD_CONFIRM_LABEL}
      isSaving={control.isSaving}
      canSubmit={control.canSubmit}
      onCancel={onClose}
      onSubmit={control.submit}
    >
      <KkSessionField
        name="firstSessionYear"
        label={FIRST_LABEL}
        value={control.firstSessionYear}
        onChange={control.setFirstSessionYear}
        currentSessionYear={control.currentSessionYear}
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
    </FactEditorFrame>
  );
};
