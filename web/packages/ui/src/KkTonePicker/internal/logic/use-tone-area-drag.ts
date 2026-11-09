import type { KeyboardEvent, PointerEvent } from 'react';
import { useState } from 'react';
import type { KkHsv } from '../../../internal/tone-color';
import { hsvAfterKey, hsvAtPoint } from './tone-area';

export interface KkToneAreaHandlers {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export const useToneAreaDrag = (hsv: KkHsv, onPick: (hsv: KkHsv) => void): KkToneAreaHandlers => {
  const [isDragging, setIsDragging] = useState(false);

  const pickAt = (event: PointerEvent<HTMLElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    onPick(hsvAtPoint(hsv, box, event.clientX, event.clientY));
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    pickAt(event);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    if (isDragging) {
      pickAt(event);
    }
  };

  const release = (): void => {
    setIsDragging(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    const next = hsvAfterKey(hsv, event.key);
    if (next !== null) {
      event.preventDefault();
      onPick(next);
    }
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: release,
    onPointerCancel: release,
    onKeyDown,
  };
};
