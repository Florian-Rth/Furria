import type { RefObject } from 'react';
import { useEffect } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export type FollowTarget = 'card' | 'row';

const SELECTORS: Record<FollowTarget, string> = {
  card: '[data-kk-studio-b-card]',
  row: '[data-kk-studio-b-step="current"]',
};

const BLOCKS: Record<FollowTarget, ScrollLogicalPosition> = { card: 'start', row: 'nearest' };

export const useFollowCurrent = (
  containerRef: RefObject<HTMLElement | null>,
  stepId: number | null,
  following: boolean,
  target: FollowTarget,
): void => {
  useEffect(() => {
    if (!following || stepId === null) {
      return;
    }

    const element = containerRef.current?.querySelector(SELECTORS[target]);
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;

    element?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: BLOCKS[target] });
  }, [containerRef, stepId, following, target]);
};
