import type { PointerEvent } from 'react';
import { useRef } from 'react';

export interface KkStudioShare {
  x: number;
  y: number;
}

export interface KkStudioDragHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
}

export interface KkStudioDragOptions {
  onPress?: (share: KkStudioShare) => void;
  onMove?: (share: KkStudioShare) => void;
  onEnd?: (moved: boolean) => void;
}

interface Grab {
  x: number;
  y: number;
  box: DOMRect;
  moved: boolean;
}

const TRACK = '[data-kk-studio-track]';
const THRESHOLD_PX = 4;

const clamp = (value: number): number => Math.min(1, Math.max(0, value));

const shareOf = (event: PointerEvent<HTMLElement>, box: DOMRect): KkStudioShare => ({
  x: box.width <= 0 ? 0 : clamp((event.clientX - box.left) / box.width),
  y: box.height <= 0 ? 0 : clamp((event.clientY - box.top) / box.height),
});

export const useStudioDrag = (options: KkStudioDragOptions): KkStudioDragHandlers => {
  const grab = useRef<Grab | null>(null);

  const finish = (): void => {
    const held = grab.current;
    grab.current = null;
    if (held !== null) {
      options.onEnd?.(held.moved);
    }
  };

  return {
    onPointerDown: (event) => {
      const track = event.currentTarget.closest(TRACK) ?? event.currentTarget;
      const box = track.getBoundingClientRect();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      grab.current = { x: event.clientX, y: event.clientY, box, moved: false };
      options.onPress?.(shareOf(event, box));
    },
    onPointerMove: (event) => {
      const held = grab.current;
      if (held === null) {
        return;
      }
      if (
        !held.moved &&
        Math.hypot(event.clientX - held.x, event.clientY - held.y) < THRESHOLD_PX
      ) {
        return;
      }
      held.moved = true;
      options.onMove?.(shareOf(event, held.box));
    },
    onPointerUp: finish,
    onPointerCancel: finish,
  };
};
