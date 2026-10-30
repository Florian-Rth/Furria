import type { PointerEvent } from 'react';
import { useRef } from 'react';
import type { PageDirection } from '../studio-i-spans';
import { swipeDirectionOf } from '../studio-i-swipe';

export interface StudioISwipe {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
}

export const useStudioISwipe = (go: (direction: PageDirection) => void): StudioISwipe => {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onPointerDown: (event) => {
      start.current = { x: event.clientX, y: event.clientY };
    },
    onPointerUp: (event) => {
      const from = start.current;
      start.current = null;
      if (from === null) {
        return;
      }
      const direction = swipeDirectionOf(event.clientX - from.x, event.clientY - from.y);
      if (direction !== null) {
        go(direction);
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
};
