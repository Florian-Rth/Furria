import type { KeyboardEvent, PointerEvent } from 'react';
import { useState } from 'react';

const SWIPE_COMMIT = 0.2;
const REJECT_PULL = 90;
const SLOTS: readonly string[] = ['1', '2', '3'];
const SHIFTED_SLOTS: Record<string, number> = { '!': 0, '"': 1, '§': 2, '@': 1, '#': 2 };

export interface KkLightTableIntents {
  onStep: (delta: number) => void;
  onReject: (wholeScene: boolean) => void;
  onFile: (slot: number, wholeScene: boolean) => void;
  onUndo: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface KkLightTableGestures {
  drag: { x: number; y: number };
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}

const AT_REST = { x: 0, y: 0 };

const slotOf = (key: string): number | null => {
  const plain = SLOTS.indexOf(key);
  if (plain >= 0) {
    return plain;
  }
  return SHIFTED_SLOTS[key] ?? null;
};

const SIMPLE_KEYS: Record<string, (intents: KkLightTableIntents, shift: boolean) => void> = {
  ArrowRight: (intents) => intents.onStep(1),
  ArrowLeft: (intents) => intents.onStep(-1),
  j: (intents) => intents.onStep(1),
  k: (intents) => intents.onStep(-1),
  x: (intents, shift) => intents.onReject(shift),
  X: (intents) => intents.onReject(true),
  z: (intents) => intents.onUndo(),
  Enter: (intents) => intents.onConfirm(),
  Escape: (intents) => intents.onCancel(),
};

export const useLightTableGestures = (intents: KkLightTableIntents): KkLightTableGestures => {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(AT_REST);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const simple = SIMPLE_KEYS[event.key];
    if (simple !== undefined) {
      event.preventDefault();
      simple(intents, event.shiftKey);
      return;
    }
    const slot = slotOf(event.key);
    if (slot !== null) {
      event.preventDefault();
      intents.onFile(slot, event.shiftKey);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setOrigin({ x: event.clientX, y: event.clientY });
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (origin === null) {
      return;
    }
    setDrag({ x: event.clientX - origin.x, y: Math.max(event.clientY - origin.y, 0) });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>): void => {
    const width = event.currentTarget.getBoundingClientRect().width;
    if (drag.y > REJECT_PULL && drag.y > Math.abs(drag.x)) {
      intents.onReject(false);
    } else if (Math.abs(drag.x) > width * SWIPE_COMMIT) {
      intents.onStep(drag.x < 0 ? 1 : -1);
    }
    setOrigin(null);
    setDrag(AT_REST);
  };

  return { drag, onKeyDown, onPointerDown, onPointerMove, onPointerUp };
};
