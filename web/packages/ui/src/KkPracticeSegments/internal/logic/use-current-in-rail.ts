import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const RAIL_SELECTOR = '[data-kk-practice-rail]';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

const keepInRail = (tile: HTMLElement): void => {
  const rail = tile.closest<HTMLElement>(RAIL_SELECTOR);
  if (rail === null) {
    return;
  }

  const railBox = rail.getBoundingClientRect();
  const tileBox = tile.getBoundingClientRect();
  if (tileBox.left >= railBox.left && tileBox.right <= railBox.right) {
    return;
  }

  const centred =
    rail.scrollLeft + tileBox.left - railBox.left - (railBox.width - tileBox.width) / 2;
  rail.scrollTo({
    left: centred,
    behavior: window.matchMedia(REDUCED_MOTION).matches ? 'auto' : 'smooth',
  });
};

export const useCurrentInRail = (current: boolean): RefObject<HTMLButtonElement | null> => {
  const tile = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (current && tile.current !== null) {
      keepInRail(tile.current);
    }
  }, [current]);

  return tile;
};
