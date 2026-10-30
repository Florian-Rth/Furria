import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const LEAD_SHARE = 3;

export const useFollowCurrent = (
  currentIndex: number | null,
): RefObject<HTMLOListElement | null> => {
  const listRef = useRef<HTMLOListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const item = currentIndex === null ? null : list?.children.item(currentIndex);
    if (list === null || !(item instanceof HTMLElement)) {
      return;
    }
    const offset =
      item.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    list.scrollTo({
      top: Math.max(0, offset - list.clientHeight / LEAD_SHARE),
      behavior: 'smooth',
    });
  }, [currentIndex]);

  return listRef;
};
