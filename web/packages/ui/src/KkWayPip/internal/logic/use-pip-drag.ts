import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useRef, useState } from 'react';
import type { KkWayPipCorner } from './pip-corner';
import { isTap, nearestCornerOf } from './pip-corner';

interface DragOffset {
  x: number;
  y: number;
}

interface DragStart {
  pointerId: number;
  x: number;
  y: number;
}

export interface PipDrag {
  ref: RefObject<HTMLDivElement | null>;
  offset: DragOffset;
  dragging: boolean;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
  onClick: () => void;
}

const RESTING: DragOffset = { x: 0, y: 0 };

export const usePipDrag = (
  onCorner: (corner: KkWayPipCorner) => void,
  onTap: () => void,
): PipDrag => {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<DragStart | null>(null);
  const moved = useRef(false);
  const [offset, setOffset] = useState<DragOffset>(RESTING);
  const [dragging, setDragging] = useState(false);

  const settle = (): void => {
    start.current = null;
    setDragging(false);
    setOffset(RESTING);
  };

  return {
    ref,
    offset,
    dragging,
    onPointerDown: (event) => {
      start.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove: (event) => {
      const from = start.current;
      if (from === null || from.pointerId !== event.pointerId) {
        return;
      }
      const travel = { x: event.clientX - from.x, y: event.clientY - from.y };
      if (!isTap(travel.x, travel.y)) {
        setDragging(true);
      }
      setOffset(travel);
    },
    onPointerUp: (event) => {
      const from = start.current;
      if (from === null || from.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - from.x;
      const dy = event.clientY - from.y;
      const pip = ref.current;
      const field = pip?.parentElement ?? null;

      moved.current = !isTap(dx, dy);
      if (moved.current && pip !== null && field !== null) {
        const box = pip.getBoundingClientRect();
        const room = field.getBoundingClientRect();
        onCorner(
          nearestCornerOf(
            (box.left + box.width / 2 - room.left) / room.width,
            (box.top + box.height / 2 - room.top) / room.height,
          ),
        );
      }
      settle();
    },
    onPointerCancel: settle,
    onClick: () => {
      if (moved.current) {
        moved.current = false;
        return;
      }
      onTap();
    },
  };
};
