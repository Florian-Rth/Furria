import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import type { OverflowEdges } from './overflow-edges';
import { computeOverflowEdges } from './overflow-edges';

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
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null || typeof ResizeObserver === 'undefined') {
      return;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of el.children) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [measure]);

  return { ref, edges, onScroll: measure };
};
