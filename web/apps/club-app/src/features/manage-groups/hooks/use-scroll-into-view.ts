import { useIsMobile } from '@furria/ui';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { scrollElementIntoView } from '@/lib/scroll-to';

export const useScrollIntoView = (key: number | null): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (key === null || !isMobile) {
      return;
    }

    scrollElementIntoView(ref.current, 'start');
  }, [key, isMobile]);

  return ref;
};
