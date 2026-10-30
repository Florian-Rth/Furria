import type { PageDirection } from './studio-i-spans';

const SWIPE_PX = 56;
const STEEPNESS = 1.5;

export const swipeDirectionOf = (dx: number, dy: number): PageDirection | null => {
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * STEEPNESS) {
    return null;
  }

  return dx < 0 ? 'forward' : 'back';
};
