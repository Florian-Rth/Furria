import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

export interface FitZoom {
  ref: RefObject<HTMLDivElement | null>;
  zoom: number;
}

export const useFitZoom = (layoutWidth: number): FitZoom => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    const measure = (): void => {
      setZoom(node.clientWidth / layoutWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [layoutWidth]);

  return { ref, zoom };
};
