import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

const subpixelTolerance = 1;

export interface OverflowEdges {
  start: boolean;
  end: boolean;
}

export const computeOverflowEdges = (
  scrollLeft: number,
  clientWidth: number,
  scrollWidth: number,
): OverflowEdges => ({
  start: scrollLeft > subpixelTolerance,
  end: scrollLeft + clientWidth < scrollWidth - subpixelTolerance,
});

interface OverflowEdgesState {
  ref: RefObject<HTMLDivElement | null>;
  edges: OverflowEdges;
  onScroll: () => void;
}

export const useOverflowEdges = (): OverflowEdgesState => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState<OverflowEdges>({ start: false, end: false });

  const measure = (): void => {
    const el = ref.current;
    if (el === null) {
      return;
    }
    const next = computeOverflowEdges(el.scrollLeft, el.clientWidth, el.scrollWidth);
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next));
  };

  useLayoutEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return { ref, edges, onScroll: measure };
};
