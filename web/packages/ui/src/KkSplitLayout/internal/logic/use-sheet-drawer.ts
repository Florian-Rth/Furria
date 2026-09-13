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
import { useSheetState } from './split-layout-sheet-context';

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
  const sheet = useSheetState();
  const reducedMotion = useReducedMotion();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const hasOpenedRef = useRef(false);
  const didDragRef = useRef(false);
  const y = useMotionValue(OFFSCREEN_Y);
  const [sheetHeight, setSheetHeight] = useState(0);
  const isOpen = sheet.isSheetOpen;
  const setOpen = sheet.setSheetOpen;
  const travel = Math.max(0, sheetHeight - SHEET_PEEK_HEIGHT);
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
    if (isOpen) {
      return;
    }
    y.set(travel);
  }, [isOpen, travel, y]);

  useEffect(() => {
    if (sheetHeight === 0 || hasOpenedRef.current) {
      return;
    }

    hasOpenedRef.current = true;
    setOpen(true);
    void animate(y, 0, transition);
  }, [sheetHeight, setOpen, transition, y]);

  const settle = (snap: 'open' | 'closed'): void => {
    setOpen(snap === 'open');
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
