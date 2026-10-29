import type { MouseEvent } from 'react';
import { presalePlacesAnchorId } from '@/features/events/event-detail-content';

const resolveScrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

export const usePresalePlacesJump = (): ((event: MouseEvent<HTMLAnchorElement>) => void) => {
  const jumpToPresalePlaces = (event: MouseEvent<HTMLAnchorElement>): void => {
    const target = document.getElementById(presalePlacesAnchorId);
    if (target === null) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ behavior: resolveScrollBehavior(), block: 'start' });
  };

  return jumpToPresalePlaces;
};
