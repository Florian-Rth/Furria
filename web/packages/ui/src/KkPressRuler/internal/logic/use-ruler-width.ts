import { useEffect, useState } from 'react';

export interface RulerWidth {
  ref: (node: HTMLDivElement | null) => void;
  width: number | null;
}

export const useRulerWidth = (): RulerWidth => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    if (node === null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry !== undefined) {
        setWidth(entry.contentRect.width);
      }
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [node]);

  return { ref: setNode, width };
};
