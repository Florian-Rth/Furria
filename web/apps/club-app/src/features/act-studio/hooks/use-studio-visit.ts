import { useKkNotice } from '@furria/ui/KkNotice';
import { useEffect } from 'react';
import { EDITOR_NOTE_GROUP, EDITOR_NOTE_TEXT } from '../document-copy';
import { historyKeyOf } from '../studio-history-keys';
import { useStudioHistoryControls } from './use-studio-history-controls';

const NO_ACT = 0;
const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

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

  useEffect(() => {
    if (actId === null) {
      return;
    }

    const press = (event: KeyboardEvent): void => {
      const key = historyKeyOf({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        typing: isTypingTarget(event.target),
      });
      if (key === null || event.defaultPrevented || event.repeat) {
        return;
      }
      if (key === 'undo' && canUndo) {
        event.preventDefault();
        undo();
      }
      if (key === 'redo' && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, [actId, undo, redo, canUndo, canRedo]);
};
