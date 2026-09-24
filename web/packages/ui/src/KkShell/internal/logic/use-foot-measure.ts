import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

export interface KkFootMeasure {
  ref: RefObject<HTMLDivElement | null>;
  measured: number | null;
}

export const useFootMeasure = (active: boolean): KkFootMeasure => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;

    if (!active || node === null) {
      setMeasured(null);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry !== undefined) {
        setMeasured(entry.contentRect.height);
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [active]);

  return { ref, measured };
};
