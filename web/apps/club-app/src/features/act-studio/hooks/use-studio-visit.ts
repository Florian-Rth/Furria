import { EDITOR_NOTE_GROUP, EDITOR_NOTE_TEXT } from '@furria/studio/document-copy';
import { useStudioKeys } from '@furria/studio/use-studio-keys';
import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect } from 'react';
import { useStudioHistoryControls } from './use-studio-history-controls';

const NO_ACT = 0;
export const useStudioVisit = (actId: number | null): void => {
  const { undo, redo, canUndo, canRedo, views } = useStudioHistoryControls(actId ?? NO_ACT);
  const raise = useKkNotice();

  useEffect(() => {
    for (const { snapshot, editor } of views) {
      if (snapshot.note !== null) {
        raise({
          tone: 'info',
          icon: 'undo',
          group: EDITOR_NOTE_GROUP,
          message: EDITOR_NOTE_TEXT[snapshot.note.kind],
        });
        editor.dismissNote();
      }
    }
  }, [views, raise]);

  useStudioKeys({ undo: canUndo ? undo : null, redo: canRedo ? redo : null }, actId !== null);
};
