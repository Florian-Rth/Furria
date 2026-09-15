import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import { scrollElementIntoView } from '@/lib/scroll-to';

export const useDetailScroll = (roleId: number | null): RefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (roleId === null) {
      return;
    }

    scrollElementIntoView(ref.current, 'start');
  }, [roleId]);

  return ref;
};
