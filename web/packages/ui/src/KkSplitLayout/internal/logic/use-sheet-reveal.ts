import type { MotionValue } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSheetState } from './split-layout-sheet-context';

const OFFSCREEN_Y = 4000;
const SPRING = { type: 'spring', stiffness: 240, damping: 32, mass: 0.9 } as const;
const INSTANT = { duration: 0 } as const;

interface SheetReveal {
  sheetRef: RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
}

export const useSheetReveal = (): SheetReveal => {
  const sheet = useSheetState();
  const reducedMotion = useReducedMotion();
  const sheetRef = useRef<HTMLDivElement>(null);
  const hasRevealedRef = useRef(false);
  const y = useMotionValue(OFFSCREEN_Y);
  const [sheetHeight, setSheetHeight] = useState(0);
  const setOpen = sheet.setSheetOpen;
  const transition = reducedMotion === true ? INSTANT : SPRING;

  useMotionValueEvent(y, 'change', (value) => {
    sheet.lift.set(`${Math.max(0, sheetHeight - value)}px`);
  });

  useEffect(() => {
    const node = sheetRef.current;

    if (node === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setSheetHeight(node.getBoundingClientRect().height);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (sheetHeight === 0 || hasRevealedRef.current) {
      return;
    }

    hasRevealedRef.current = true;
    setOpen(true);
    void animate(y, 0, transition);
  }, [sheetHeight, setOpen, transition, y]);

  return { sheetRef, y };
};
