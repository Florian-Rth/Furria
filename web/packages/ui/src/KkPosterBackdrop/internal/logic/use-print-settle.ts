import { useEffect, useState } from 'react';

const INPUT_INTERRUPTS = ['pointerdown', 'wheel', 'keydown', 'touchstart'] as const;
const LISTENING: AddEventListenerOptions = { capture: true, passive: true };

export const usePrintSettle = (): boolean => {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (settled) {
      return;
    }

    const settle = (): void => {
      setSettled(true);
    };

    for (const type of INPUT_INTERRUPTS) {
      window.addEventListener(type, settle, LISTENING);
    }

    return () => {
      for (const type of INPUT_INTERRUPTS) {
        window.removeEventListener(type, settle, LISTENING);
      }
    };
  }, [settled]);

  return settled;
};
