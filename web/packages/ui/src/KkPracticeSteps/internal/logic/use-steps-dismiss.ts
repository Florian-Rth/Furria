import type { PointerEvent } from 'react';
import { useEffect, useRef } from 'react';

const SWIPE_CLOSE_PX = 56;

export interface StepsDismiss {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
}

export const useStepsDismiss = (open: boolean, onClose: () => void): StepsDismiss => {
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  return {
    onPointerDown: (event) => {
      startY.current = event.clientY;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerUp: (event) => {
      const start = startY.current;
      startY.current = null;
      if (start !== null && event.clientY - start > SWIPE_CLOSE_PX) {
        onClose();
      }
    },
    onPointerCancel: () => {
      startY.current = null;
    },
  };
};
