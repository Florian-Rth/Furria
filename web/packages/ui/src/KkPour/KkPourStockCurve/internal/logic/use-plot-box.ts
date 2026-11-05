import { useEffect, useState } from 'react';

export interface PlotSize {
  width: number;
  height: number;
}

export interface PlotBox {
  ref: (node: HTMLDivElement | null) => void;
  size: PlotSize | null;
}

export const usePlotBox = (): PlotBox => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState<PlotSize | null>(null);

  useEffect(() => {
    if (node === null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

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
