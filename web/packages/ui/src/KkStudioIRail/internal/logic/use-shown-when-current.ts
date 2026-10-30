import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const RAIL = '[data-kk-studio-i-rail]';
const MARGIN_PX = 16;

const revealIn = (rail: HTMLElement, tile: HTMLElement): void => {
  const outer = rail.getBoundingClientRect();
  const inner = tile.getBoundingClientRect();
  const left =
    inner.left < outer.left
      ? inner.left - outer.left - MARGIN_PX
      : Math.max(0, inner.right - outer.right + MARGIN_PX);
  const top =
    inner.top < outer.top
      ? inner.top - outer.top - MARGIN_PX
      : Math.max(0, inner.bottom - outer.bottom + MARGIN_PX);

  if (left !== 0 || top !== 0) {
    rail.scrollBy({ left, top, behavior: 'smooth' });
  }
};

export const useShownWhenCurrent = (current: boolean): RefObject<HTMLButtonElement | null> => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tile = ref.current;
    const rail = tile?.closest<HTMLElement>(RAIL);
    if (current && tile !== null && tile !== undefined && rail !== null && rail !== undefined) {
      revealIn(rail, tile);
    }
  }, [current]);

  return ref;
};
