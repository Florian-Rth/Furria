import { useEffect, useState } from 'react';
import type { StageBox } from '../stage-names';

export interface BoxSize {
  ref: (node: HTMLDivElement | null) => void;
  size: StageBox | null;
}

export const useBoxSize = (): BoxSize => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<StageBox | null>(null);

  useEffect(() => {
    if (node === null) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      if (entry !== undefined) {
        setSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node]);

  return { ref: setNode, size };
};
