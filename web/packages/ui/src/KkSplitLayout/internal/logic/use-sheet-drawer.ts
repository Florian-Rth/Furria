import type { DragControls, MotionValue, PanInfo } from 'motion/react';
import {
  animate,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
} from 'motion/react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SHEET_PEEK_HEIGHT } from './sheet-metrics';
import { resolveSheetSnap } from './sheet-snap';
import { useSheetLift } from './split-layout-sheet-context';

const OPEN_DELAY_MS = 2400;
const OFFSCREEN_Y = 4000;
const SPRING = { type: 'spring', stiffness: 240, damping: 32, mass: 0.9 } as const;
const INSTANT = { duration: 0 } as const;

interface SheetDrawer {
  sheetRef: RefObject<HTMLDivElement | null>;
  y: MotionValue<number>;
  travel: number;
  isOpen: boolean;
  dragControls: DragControls;
  startDrag: (event: ReactPointerEvent<Element>) => void;
  endDrag: (event: globalThis.PointerEvent, info: PanInfo) => void;
  toggle: () => void;
}

export const useSheetDrawer = (): SheetDrawer => {
  const sheetLift = useSheetLift();
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const hasScheduledRef = useRef(false);
  const didDragRef = useRef(false);
  const y = useMotionValue(OFFSCREEN_Y);
  const [sheetHeight, setSheetHeight] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const travel = Math.max(0, sheetHeight - SHEET_PEEK_HEIGHT);
  const transition = reducedMotion === true ? INSTANT : SPRING;

  useMotionValueEvent(y, 'change', (value) => {
    sheetLift.set(`${Math.max(0, sheetHeight - value)}px`);
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
    if (isOpen) {
      return;
    }
    y.set(travel);
  }, [isOpen, travel, y]);

  useEffect(() => {
    if (sheetHeight === 0 || hasScheduledRef.current) {
      return;
    }

    hasScheduledRef.current = true;

    const timer = window.setTimeout(() => {
      setIsOpen(true);
      void animate(y, 0, transition);
    }, OPEN_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [sheetHeight, transition, y]);

  const settle = (snap: 'open' | 'closed'): void => {
    setIsOpen(snap === 'open');
    void animate(y, snap === 'open' ? 0 : travel, transition);
  };

  const startDrag = (event: ReactPointerEvent<Element>): void => {
    didDragRef.current = false;
    dragControls.start(event);
  };

  const endDrag = (_event: globalThis.PointerEvent, info: PanInfo): void => {
    didDragRef.current = true;
    settle(resolveSheetSnap(y.get(), info.velocity.y, travel));
  };

  const toggle = (): void => {
    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }
    settle(isOpen ? 'closed' : 'open');
  };

  return { sheetRef, y, travel, isOpen, dragControls, startDrag, endDrag, toggle };
};
