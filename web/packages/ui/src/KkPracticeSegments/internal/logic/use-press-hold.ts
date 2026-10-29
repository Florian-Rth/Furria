import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';

const HOLD_MS = 480;

export interface PressHoldHandlers {
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerCancel: () => void;
  onClick: () => void;
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
    onPointerDown: () => {
      held.current = false;
      stop();
      timer.current = setTimeout(() => {
        held.current = true;
        timer.current = null;
        onHold();
      }, HOLD_MS);
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onClick: () => {
      if (held.current) {
        held.current = false;
        return;
      }
      onPress();
    },
    onContextMenu: (event) => {
      event.preventDefault();
    },
  };
};
