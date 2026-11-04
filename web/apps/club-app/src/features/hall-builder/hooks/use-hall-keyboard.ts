import { useEffect, useLayoutEffect, useRef } from 'react';
import type { HallCommand } from '../hall-keys';
import { hallCommandOf } from '../hall-keys';

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export const useHallKeyboard = (onCommand: (command: HallCommand) => void): void => {
  const handler = useRef(onCommand);

  useLayoutEffect(() => {
    handler.current = onCommand;
  });

  useEffect(() => {
    const press = (event: KeyboardEvent): void => {
      const command = hallCommandOf({
        key: event.key,
        modKey: event.ctrlKey || event.metaKey,
        shiftKey: event.shiftKey,
        inField: isTypingTarget(event.target),
      });
      if (command === null) {
        return;
      }
      event.preventDefault();
      handler.current(command);
    };
    window.addEventListener('keydown', press);

    return () => {
      window.removeEventListener('keydown', press);
    };
  }, []);
};
