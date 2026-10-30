import type { MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef } from 'react';

const HOLD_MS = 480;
const PRIMARY_BUTTON = 0;
const KEYBOARD_CLICK = 0;

export interface PressHoldHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLElement>) => void;
}

export const usePressHold = (onPress: () => void, onHold: () => void): PressHoldHandlers => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);

  const stop = (): void => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => stop, []);

  return {
    onPointerDown: (event) => {
      held.current = false;
      stop();
      if (event.button !== PRIMARY_BUTTON) {
        return;
      }
      timer.current = setTimeout(() => {
        held.current = true;
        timer.current = null;
        onHold();
      }, HOLD_MS);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick: (event) => {
      const afterHold = held.current && event.detail !== KEYBOARD_CLICK;
      held.current = false;
      if (!afterHold) {
        onPress();
      }
    },
    onContextMenu: (event) => {
      event.preventDefault();
    },
  };
};
