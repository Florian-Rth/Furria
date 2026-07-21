import type { RefObject } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { MASTHEAD_HEIGHT_CSS_VAR } from '../masthead-height';

export const usePublishMastheadHeight = <T extends HTMLElement>(): RefObject<T | null> => {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const publishHeight = (height: number): void => {
      document.documentElement.style.setProperty(MASTHEAD_HEIGHT_CSS_VAR, `${height}px`);
    };

    publishHeight(element.getBoundingClientRect().height);

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        publishHeight(entry.contentRect.height);
      }
    });
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
};
