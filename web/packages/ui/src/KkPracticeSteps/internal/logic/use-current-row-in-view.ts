import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

export const useCurrentRowInView = (open: boolean): RefObject<HTMLDivElement | null> => {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    const list = panel.current?.querySelector<HTMLElement>('[data-kk-practice-steps-list]');
    const row = list?.querySelector<HTMLElement>(
      '[data-kk-practice-steps-row][data-current="true"]',
    );
    if (list !== null && list !== undefined && row !== null && row !== undefined) {
      list.scrollTop = row.offsetTop - list.offsetTop - (list.clientHeight - row.offsetHeight) / 2;
    }
  }, [open]);

  return panel;
};
