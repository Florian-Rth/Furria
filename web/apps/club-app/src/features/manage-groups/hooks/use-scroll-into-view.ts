import { useIsMobile } from '@furria/ui';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useScrollIntoView = (key: number | null): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (key === null || !isMobile) {
      return;
    }

    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [key, isMobile]);

  return ref;
};
