import type { PointerEvent, PointerEventHandler } from 'react';
import { useRef } from 'react';
import type { KkStudioGScrubPhase } from './use-timeline-gestures';

const DRAG_THRESHOLD_PX = 3;

export type KkStudioGDrag = (phase: KkStudioGScrubPhase, deltaPx: number) => void;

export interface KkStudioGDragHandlers {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
}

interface Hold {
  pointerId: number;
  startX: number;
  moved: boolean;
}

export const useDragDelta = (onDrag: KkStudioGDrag | null): KkStudioGDragHandlers | null => {
  const hold = useRef<Hold | null>(null);

  const end = (event: PointerEvent<HTMLElement>): void => {
    const current = hold.current;
    hold.current = null;
    if (onDrag !== null && current?.moved === true) {
      onDrag('end', event.clientX - current.startX);
    }
  };

  if (onDrag === null) {
    return null;
  }

  return {
    onPointerDown: (event) => {
      if (event.button !== 0) {
        return;
      }
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      hold.current = { pointerId: event.pointerId, startX: event.clientX, moved: false };
    },
    onPointerMove: (event) => {
      const current = hold.current;
      if (current === null || current.pointerId !== event.pointerId) {
        return;
      }
      const delta = event.clientX - current.startX;
      if (!current.moved && Math.abs(delta) < DRAG_THRESHOLD_PX) {
        return;
      }
      if (!current.moved) {
        current.moved = true;
        onDrag('start', 0);
      }
      onDrag('move', delta);
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
};
