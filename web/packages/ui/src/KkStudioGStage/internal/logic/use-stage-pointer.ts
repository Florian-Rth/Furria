import type { PointerEvent, PointerEventHandler } from 'react';
import { useRef } from 'react';

const DRAG_THRESHOLD_PX = 4;

export interface KkStudioGStageShareBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface KkStudioGStageGestures {
  onDotDown: (spotId: number, additive: boolean) => void;
  onDragStart: () => void;
  onDrag: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onBox: (box: KkStudioGStageShareBox | null) => void;
  onBoxEnd: (box: KkStudioGStageShareBox) => void;
  onEmptyTap: () => void;
}

export interface KkStudioGStagePointer {
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
}

interface Press {
  pointerId: number;
  kind: 'dot' | 'box';
  startX: number;
  startY: number;
  left: number;
  top: number;
  width: number;
  height: number;
  moved: boolean;
}

const isAdditive = (event: PointerEvent<HTMLDivElement>): boolean =>
  event.shiftKey || event.metaKey || event.ctrlKey;

const spotIdOf = (target: EventTarget): number | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  const dot = target.closest('[data-kk-studio-g-dot]');
  const raw = dot?.getAttribute('data-spot-id');

  return raw === null || raw === undefined ? null : Number(raw);
};

const boxOf = (press: Press, clientX: number, clientY: number): KkStudioGStageShareBox => ({
  left: (press.startX - press.left) / press.width,
  top: (press.startY - press.top) / press.height,
  right: (clientX - press.left) / press.width,
  bottom: (clientY - press.top) / press.height,
});

export const useStagePointer = (gestures: KkStudioGStageGestures | null): KkStudioGStagePointer => {
  const press = useRef<Press | null>(null);

  const finish = (event: PointerEvent<HTMLDivElement>, cancelled: boolean): void => {
    const current = press.current;
    press.current = null;
    if (current === null || gestures === null || current.pointerId !== event.pointerId) {
      return;
    }
    if (current.kind === 'dot') {
      if (current.moved) {
        gestures.onDragEnd();
      }
      return;
    }
    gestures.onBox(null);
    if (current.moved && !cancelled) {
      gestures.onBoxEnd(boxOf(current, event.clientX, event.clientY));
    } else if (!cancelled) {
      gestures.onEmptyTap();
    }
  };

  return {
    onPointerDown: (event) => {
      if (gestures === null || press.current !== null || event.button !== 0) {
        return;
      }
      const rect = event.currentTarget.getBoundingClientRect();
      const spotId = spotIdOf(event.target);
      press.current = {
        pointerId: event.pointerId,
        kind: spotId === null ? 'box' : 'dot',
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        moved: false,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      if (spotId !== null) {
        gestures.onDotDown(spotId, isAdditive(event));
      }
    },
    onPointerMove: (event) => {
      const current = press.current;
      if (gestures === null || current === null || current.pointerId !== event.pointerId) {
        return;
      }
      const dx = event.clientX - current.startX;
      const dy = event.clientY - current.startY;
      if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
        return;
      }
      if (!current.moved) {
        current.moved = true;
        if (current.kind === 'dot') {
          gestures.onDragStart();
        }
      }
      if (current.kind === 'dot') {
        gestures.onDrag(dx / current.width, dy / current.height);
      } else {
        gestures.onBox(boxOf(current, event.clientX, event.clientY));
      }
    },
    onPointerUp: (event) => {
      finish(event, false);
    },
    onPointerCancel: (event) => {
      finish(event, true);
    },
  };
};
