import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const CHIP_ATTRIBUTE = 'data-heute-chip';

export const useStripFollow = (focusId: number | null): RefObject<HTMLOListElement | null> => {
  const ref = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const strip = ref.current;
    if (strip === null || focusId === null) {
      return;
    }
    const chip = strip.querySelector<HTMLElement>(`[${CHIP_ATTRIBUTE}="${focusId}"]`);
    if (chip === null) {
      return;
    }
    const left = chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [focusId]);

  return ref;
};
