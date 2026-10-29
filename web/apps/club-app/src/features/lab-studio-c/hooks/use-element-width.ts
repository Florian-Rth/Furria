import { useEffect, useState } from 'react';

export interface ElementWidth {
  ref: (node: HTMLDivElement | null) => void;
  width: number;
}

export const useElementWidth = (): ElementWidth => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

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
