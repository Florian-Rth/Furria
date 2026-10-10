import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

const PRIMARY_BUTTON = 0;
const ASSISTIVE_CLICK = 0;

export interface KkHoldGesture {
  holding: boolean;
  hintKey: number;
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void;
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

export const useHoldGesture = ({
  holdMs,
  disabled,
  onHold,
  onAssistiveActivate,
}: KkHoldGestureInput): KkHoldGesture => {
  const [holding, setHolding] = useState(false);
  const [hintKey, setHintKey] = useState(0);
  const timer = useRef<number | null>(null);
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
    setHolding(true);
    timer.current = window.setTimeout(() => {
      timer.current = null;
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
    onPointerRelease,
    onClick,
    onKeyDown,
    onContextMenu,
  };
};
