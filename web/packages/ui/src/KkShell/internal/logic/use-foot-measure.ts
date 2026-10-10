import { useEffect, useState } from 'react';

export interface KkFootMeasure {
  ref: (node: HTMLDivElement | null) => void;
  measured: number | null;
}

export const useFootMeasure = (active: boolean): KkFootMeasure => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<number | null>(null);

  useEffect(() => {
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
  }, [active, node]);

  return { ref: setNode, measured };
};
