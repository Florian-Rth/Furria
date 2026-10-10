import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { isClampOverflowing } from './clamp-overflow';
import { onFontsSettled } from './font-settle';
import { useReportedCut } from './use-reported-cut';

export interface CutWatch {
  ref: RefObject<HTMLDivElement | null>;
  cut: boolean;
}

export const useCutWatch = (watching: boolean): CutWatch => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    const clamped = ref.current?.firstElementChild ?? null;
    if (!watching || clamped === null) {
      setCut(false);
      return;
    }
    const measure = (): void => {
      setCut(isClampOverflowing(clamped));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(clamped);
    const mutations = new MutationObserver(measure);
    mutations.observe(clamped, { subtree: true, characterData: true, childList: true });
    const stopFonts = onFontsSettled(measure);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      stopFonts();
    };
  }, [watching]);

  useReportedCut(watching && cut);

  return { ref, cut };
};
