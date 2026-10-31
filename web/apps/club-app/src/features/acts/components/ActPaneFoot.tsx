import { KkButton } from '@furria/ui/KkButton';
import { KkMeta } from '@furria/ui/KkMeta';
import { KkStickyFoot } from '@furria/ui/KkStickyFoot';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import {
  ARCHIVE_LABEL,
  ARCHIVED_NOTE,
  CREATE_LABEL,
  RESTORE_LABEL,
  SAVE_LABEL,
  toClosedActNote,
} from '../acts-copy';
import type { ActEditor } from '../hooks/use-act-editor';

interface ActPaneFootProps {
  editor: ActEditor;
}

export const ActPaneFoot: FC<ActPaneFootProps> = ({ editor }) => {
  if (editor.closed) {
    const note = toClosedActNote(editor.act?.sessionYear ?? null);

    return (
      <KkStickyFoot>
        <KkMeta>{note}</KkMeta>
      </KkStickyFoot>
    );
  }

  if (editor.act?.archived === true) {
    return (
      <KkStickyFoot>
        <KkMeta>{ARCHIVED_NOTE}</KkMeta>
        <KkButton
          variant="contained"
          fullWidth
          loading={editor.isArchiving}
          onClick={editor.toggleArchived}
        >
          {RESTORE_LABEL}
        </KkButton>
      </KkStickyFoot>
    );
  }

  const label = editor.isNew ? CREATE_LABEL : SAVE_LABEL;
  const archive = editor.isNew ? null : (
    <Stack direction="row" sx={{ justifyContent: 'center' }}>
      <KkButton
        size="small"
        variant="text"
        tone="danger"
        loading={editor.isArchiving}
        onClick={editor.toggleArchived}
      >
        {ARCHIVE_LABEL}
      </KkButton>
    </Stack>
  );

  return (
    <KkStickyFoot>
      <KkButton
        variant="contained"
        fullWidth
        disabled={!editor.state.canSave}
        loading={editor.isSaving}
        onClick={editor.save}
      >
        {label}
      </KkButton>
      {archive}
    </KkStickyFoot>
  );
};
