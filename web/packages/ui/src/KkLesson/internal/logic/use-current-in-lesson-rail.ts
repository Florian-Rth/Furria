import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';

const RAIL_SELECTOR = '[data-kk-lesson-rail]';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const LEAD_SHARE = 0.35;

const keepInRail = (tile: HTMLElement): void => {
  const rail = tile.closest<HTMLElement>(RAIL_SELECTOR);
  if (rail === null) {
    return;
  }

  const railBox = rail.getBoundingClientRect();
  const tileBox = tile.getBoundingClientRect();
  const lead = railBox.width * LEAD_SHARE;
  const target = rail.scrollLeft + tileBox.left - railBox.left - lead;

  rail.scrollTo({
    left: Math.max(0, target),
    behavior: window.matchMedia(REDUCED_MOTION).matches ? 'auto' : 'smooth',
  });
};

export const useCurrentInLessonRail = (current: boolean): RefObject<HTMLButtonElement | null> => {
  const tile = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (current && tile.current !== null) {
      keepInRail(tile.current);
    }
  }, [current]);

  return tile;
};
