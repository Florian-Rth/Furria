import type { MotionValue } from 'motion/react';
import { useMotionValue } from 'motion/react';
import { useLayoutEffect, useRef } from 'react';
import { useStickyOffset } from './use-sticky-offset';

export interface KkTimelinePan {
  x: MotionValue<number>;
  width: number;
}

export interface StickyName {
  chipRef: (node: HTMLElement | null) => void;
  nameRef: (node: HTMLElement | null) => void;
  x: MotionValue<number>;
}

export const useStickyName = (pan: KkTimelinePan | null, from: number): StickyName => {
  const chipNode = useRef<HTMLElement | null>(null);
  const nameNode = useRef<HTMLElement | null>(null);
  const room = useMotionValue(0);
  const panX = pan?.x ?? null;
  const bandLeft = from * (pan?.width ?? 0);

  useLayoutEffect(() => {
    const chip = chipNode.current;
    const name = nameNode.current;
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

  const chipRef = (node: HTMLElement | null): void => {
    chipNode.current = node;
  };
  const nameRef = (node: HTMLElement | null): void => {
    nameNode.current = node;
  };

  return { chipRef, nameRef, x };
};
