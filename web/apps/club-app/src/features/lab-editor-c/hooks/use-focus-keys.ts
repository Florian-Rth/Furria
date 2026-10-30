import { useEffect, useRef } from 'react';
import { historyKeyOf } from '@/features/act-studio/studio-history-keys';
import type { FocusKey } from '../focus-keys';
import { focusKeyOf } from '../focus-keys';

const TYPING_TAGS: readonly string[] = ['INPUT', 'TEXTAREA', 'SELECT'];
const PRESSING_ROLES: readonly string[] = ['button', 'slider', 'checkbox', 'tab'];

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TYPING_TAGS.includes(target.tagName));

const isPressing = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'BUTTON' || PRESSING_ROLES.includes(target.getAttribute('role') ?? ''));

export interface FocusKeyActions {
  run: (key: FocusKey) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const useFocusKeys = (actions: FocusKeyActions): void => {
  const latest = useRef(actions);

  useEffect(() => {
    latest.current = actions;
  });

  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.repeat) {
        return;
      }
      const typing = isTyping(event.target);
      const current = latest.current;
      const history = historyKeyOf({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        typing,
      });
      if (history === 'undo' && current.canUndo) {
        event.preventDefault();
        current.undo();
        return;
      }
      if (history === 'redo' && current.canRedo) {
        event.preventDefault();
        current.redo();
        return;
      }
      const key = focusKeyOf({
        key: event.key,
        shiftKey: event.shiftKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        typing,
        pressing: isPressing(event.target),
      });
      if (key !== null) {
        event.preventDefault();
        current.run(key);
      }
    };

    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, []);
};
