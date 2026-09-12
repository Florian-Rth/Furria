import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const STICKY_BAR_HEIGHT_VARIABLE = '--kk-sticky-bar-height';

export const useStickyBarHeight = (): RefObject<HTMLDivElement | null> => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = barRef.current;
    const scope = node?.parentElement ?? null;

    if (node === null || scope === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
      scope.style.setProperty(STICKY_BAR_HEIGHT_VARIABLE, `${node.offsetHeight}px`);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
      scope.style.removeProperty(STICKY_BAR_HEIGHT_VARIABLE);
    };
  }, []);

  return barRef;
};
