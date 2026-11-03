import type { MotionValue } from 'motion/react';
import { useMotionValue } from 'motion/react';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { useStickyOffset } from './use-sticky-offset';

export interface KkTimelinePan {
  x: MotionValue<number>;
  width: number;
}

export interface StickyName {
  chipRef: RefObject<HTMLSpanElement | null>;
  nameRef: RefObject<HTMLSpanElement | null>;
  x: MotionValue<number>;
}

export const useStickyName = (pan: KkTimelinePan | null, from: number): StickyName => {
  const chipRef = useRef<HTMLSpanElement | null>(null);
  const nameRef = useRef<HTMLSpanElement | null>(null);
  const room = useMotionValue(0);
  const panX = pan?.x ?? null;
  const bandLeft = from * (pan?.width ?? 0);

  useLayoutEffect(() => {
    const chip = chipRef.current;
    const name = nameRef.current;
    if (chip === null || name === null || panX === null) {
      return;
    }
    const measure = (): void => {
      room.set(chip.clientWidth - name.offsetLeft * 2 - name.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(chip);

    return () => {
      observer.disconnect();
    };
  }, [panX, room]);

  const x = useStickyOffset(panX, bandLeft, room);

  return { chipRef, nameRef, x };
};
