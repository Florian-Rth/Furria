import type { PointerEvent, PointerEventHandler } from 'react';
import { useRef } from 'react';

const DRAG_THRESHOLD_PX = 3;

export interface KkStudioIShare {
  x: number;
  y: number;
}

export interface KkStudioIDragHandlers {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
}

interface DragStart {
  x: number;
  y: number;
  moved: boolean;
}

const clampShare = (value: number): number => Math.min(1, Math.max(0, value));

const shareIn = (event: PointerEvent<HTMLElement>, field: string): KkStudioIShare | null => {
  const box = event.currentTarget.closest(field)?.getBoundingClientRect();

  if (box === undefined || box.width <= 0 || box.height <= 0) {
    return null;
  }

  return {
    x: clampShare((event.clientX - box.left) / box.width),
    y: clampShare((event.clientY - box.top) / box.height),
  };
};

export const useKkStudioIDrag = (
  field: string,
  onPress: () => void,
  onDrag: ((share: KkStudioIShare) => void) | undefined,
): KkStudioIDragHandlers => {
  const start = useRef<DragStart | null>(null);

  const end = (event: PointerEvent<HTMLElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    start.current = null;
  };

  return {
    onPointerDown: (event) => {
      event.stopPropagation();
      start.current = { x: event.clientX, y: event.clientY, moved: false };
      event.currentTarget.setPointerCapture(event.pointerId);
      onPress();
    },
    onPointerMove: (event) => {
      const from = start.current;
      if (from === null || onDrag === undefined) {
        return;
      }
      const distance = Math.hypot(event.clientX - from.x, event.clientY - from.y);
      if (!from.moved && distance < DRAG_THRESHOLD_PX) {
        return;
      }
      from.moved = true;
      const share = shareIn(event, field);
      if (share !== null) {
        onDrag(share);
      }
    },
    onPointerUp: end,
    onPointerCancel: end,
  };
};
