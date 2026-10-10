import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { isClampOverflowing } from '../../../internal/news-surface/clamp-overflow';
import { onFontsSettled } from '../../../internal/news-surface/font-settle';
import { useReportedCut } from '../../../internal/news-surface/use-reported-cut';

export interface ClampCut {
  ref: RefObject<HTMLElement | null>;
  cut: boolean;
}

export const useClampCut = (text: string, lines: number): ClampCut => {
  const ref = useRef<HTMLElement | null>(null);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    const node = ref.current;
    if (node === null || text.length === 0 || lines < 1) {
      setCut(false);
      return;
    }
    const measure = (): void => {
      setCut(isClampOverflowing(node));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    const stopFonts = onFontsSettled(measure);
    return () => {
      observer.disconnect();
      stopFonts();
    };
  }, [text, lines]);

  useReportedCut(cut);

  return { ref, cut };
};
