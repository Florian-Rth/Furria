import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { scrollElementIntoView } from '@/lib/scroll-to';

export const useScrollIntoView = (key: number | null): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (key === null) {
      return;
    }

    scrollElementIntoView(ref.current, 'start');
  }, [key]);

  return ref;
};
