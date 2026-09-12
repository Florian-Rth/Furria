import { useIsMobile } from '@furria/ui';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { scrollElementIntoView } from '@/lib/scroll-to';

export const useDetailScroll = (roleId: number | null): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile || roleId === null) {
      return;
    }

    scrollElementIntoView(ref.current, 'start');
  }, [isMobile, roleId]);

  return ref;
};
