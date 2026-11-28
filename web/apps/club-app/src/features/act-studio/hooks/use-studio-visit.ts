import { EDITOR_NOTE_GROUP, EDITOR_NOTE_TEXT } from '@furria/studio/document-copy';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect } from 'react';
import { useStudioHistoryControls } from './use-studio-history-controls';

export const useStudioVisit = (actId: number | null): void => {
  const { undo, redo, canUndo, canRedo, view } = useStudioHistoryControls(actId);
  const raise = useKkNotice();

  useEffect(() => {
    if (view === null || view.snapshot.note === null) {
      return;
    }

    raise({
      tone: 'info',
      icon: 'undo',
      group: EDITOR_NOTE_GROUP,
      message: EDITOR_NOTE_TEXT[view.snapshot.note.kind],
    });
    view.editor.dismissNote();
  }, [view, raise]);

  useStudioKeys({ undo: canUndo ? undo : null, redo: canRedo ? redo : null }, actId !== null);
};
