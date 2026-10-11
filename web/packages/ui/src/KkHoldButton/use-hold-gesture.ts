import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { HoldPoint } from './internal/hold-drift';
import { hasHoldDrifted } from './internal/hold-drift';

const PRIMARY_BUTTON = 0;
const ASSISTIVE_CLICK = 0;

export interface KkHoldGesture {
  holding: boolean;
  hintKey: number;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onPointerRelease: () => void;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onContextMenu: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface KkHoldGestureInput {
  holdMs: number;
  disabled: boolean;
  onHold: () => void;
  onAssistiveActivate: () => void;
}

const pointOf = (event: PointerEvent<HTMLButtonElement>): HoldPoint => ({
  x: event.clientX,
  y: event.clientY,
});

export const useHoldGesture = ({
  holdMs,
  disabled,
  onHold,
  onAssistiveActivate,
}: KkHoldGestureInput): KkHoldGesture => {
  const [holding, setHolding] = useState(false);
  const [hintKey, setHintKey] = useState(0);
  const timer = useRef<number | null>(null);
  const origin = useRef<HoldPoint | null>(null);
  const latest = useRef({ disabled, onHold });

  useEffect(() => {
    latest.current = { disabled, onHold };
  });

  useEffect(
    () => () => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    },
    [],
  );

  const cancelHold = (): boolean => {
    origin.current = null;
    if (timer.current === null) {
      return false;
    }
    window.clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
    return true;
  };

  if (disabled && holding) {
    setHolding(false);
  }

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>): void => {
    if (disabled || event.button !== PRIMARY_BUTTON || timer.current !== null) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = pointOf(event);
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
      origin.current = null;
      setHolding(false);
      if (!latest.current.disabled) {
        latest.current.onHold();
      }
    }, holdMs);
  };

  const onPointerRelease = (): void => {
    if (cancelHold()) {
      setHintKey((key) => key + 1);
    }
  };

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>): void => {
    if (origin.current !== null && hasHoldDrifted(origin.current, pointOf(event))) {
      onPointerRelease();
    }
  };

  const onClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (!disabled && event.detail === ASSISTIVE_CLICK) {
      onAssistiveActivate();
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (event.repeat) {
      event.preventDefault();
    }
  };

  const onContextMenu = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
  };

  return {
    holding,
    hintKey,
    onPointerDown,
    onPointerMove,
    onPointerRelease,
    onClick,
    onKeyDown,
    onContextMenu,
  };
};
