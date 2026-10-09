import type { KeyboardEvent, PointerEvent } from 'react';
import { useState } from 'react';

const SWIPE_COMMIT = 0.18;
const CLOSE_PULL = 120;

export interface KkLoupeIntents {
  onStep: (delta: number) => void;
  onSceneStep: (delta: number) => void;
  onClose: () => void;
  onDownload: () => void;
}

export interface KkLoupeGestures {
  drag: { x: number; y: number };
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
}

const KEY_INTENTS: Record<string, (intents: KkLoupeIntents) => void> = {
  ArrowRight: (intents) => intents.onStep(1),
  ArrowLeft: (intents) => intents.onStep(-1),
  PageDown: (intents) => intents.onSceneStep(1),
  PageUp: (intents) => intents.onSceneStep(-1),
  d: (intents) => intents.onDownload(),
  Escape: (intents) => intents.onClose(),
};

const AT_REST = { x: 0, y: 0 };

export const LOUPE_CONTROL_ATTRIBUTE = 'data-kk-loupe-control';

const isOnControl = (target: EventTarget): boolean =>
  target instanceof Element && target.closest(`[${LOUPE_CONTROL_ATTRIBUTE}]`) !== null;

export const useLoupeGestures = (intents: KkLoupeIntents): KkLoupeGestures => {
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [drag, setDrag] = useState(AT_REST);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const intent = KEY_INTENTS[event.key];
    if (
      intent === undefined ||
      event.repeat ||
      (event.key !== 'Escape' && isOnControl(event.target))
    ) {
      return;
    }
    event.preventDefault();
    intent(intents);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (isOnControl(event.target)) {
      return;
    }
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
    if (drag.y > CLOSE_PULL && drag.y > Math.abs(drag.x)) {
      intents.onClose();
    } else if (Math.abs(drag.x) > width * SWIPE_COMMIT) {
      intents.onStep(drag.x < 0 ? 1 : -1);
    }
    setOrigin(null);
    setDrag(AT_REST);
  };

  return { drag, onKeyDown, onPointerDown, onPointerMove, onPointerUp };
};
