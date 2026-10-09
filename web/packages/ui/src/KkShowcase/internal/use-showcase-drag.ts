import type { KeyboardEvent, PointerEvent } from 'react';
import { useState } from 'react';

const SLOT_ATTRIBUTE = 'data-kk-showcase-slot';

export interface KkShowcaseHandle {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface ShowcaseDrag {
  dragging: number | null;
  handleOf: (index: number) => KkShowcaseHandle;
  slotAttribute: string;
}

const KEY_STEPS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1,
};

const keyTargetOf = (key: string, index: number, count: number): number | null => {
  if (key === 'Home') {
    return 0;
  }
  if (key === 'End') {
    return count - 1;
  }
  const step = KEY_STEPS[key];
  return step === undefined ? null : index + step;
};

const slotIndexAt = (x: number, y: number): number | null => {
  const slot = document.elementFromPoint(x, y)?.closest(`[${SLOT_ATTRIBUTE}]`);
  const raw = slot?.getAttribute(SLOT_ATTRIBUTE);
  return raw === null || raw === undefined ? null : Number(raw);
};

export const useShowcaseDrag = (
  count: number,
  move: (from: number, to: number) => void,
): ShowcaseDrag => {
  const [dragging, setDragging] = useState<number | null>(null);

  const finish = (event: PointerEvent<HTMLElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(null);
  };

  const handleOf = (index: number): KkShowcaseHandle => ({
    onPointerDown: (event) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(index);
    },
    onPointerMove: (event) => {
      if (dragging === null) {
        return;
      }
      const over = slotIndexAt(event.clientX, event.clientY);
      if (over !== null && over !== dragging) {
        move(dragging, over);
        setDragging(over);
      }
    },
    onPointerUp: finish,
    onPointerCancel: finish,
    onKeyDown: (event) => {
      const target = keyTargetOf(event.key, index, count);
      if (target === null) {
        return;
      }
      event.preventDefault();
      move(index, target);
    },
  });

  return { dragging, handleOf, slotAttribute: SLOT_ATTRIBUTE };
};
