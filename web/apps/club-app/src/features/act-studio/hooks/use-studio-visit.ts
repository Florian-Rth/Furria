import { useEffect } from 'react';
import { historyKeyOf } from '../studio-history-keys';
import { forgetHistory } from '../studio-history-store';
import { useStudioHistory } from './use-studio-history';
import { useStudioUndo } from './use-studio-undo';

const NO_ACT = 0;
const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

export const useStudioVisit = (actId: number | null): void => {
  const { undo, redo } = useStudioUndo(actId ?? NO_ACT);
  const { canUndo, canRedo } = useStudioHistory(actId ?? NO_ACT);

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

  useEffect(
    () => () => {
      if (actId !== null) {
        forgetHistory(actId);
      }
    },
    [actId],
  );
};
