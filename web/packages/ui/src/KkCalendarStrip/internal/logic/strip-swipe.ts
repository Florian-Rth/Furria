import type { KkCalendarPull, KkCalendarTravel } from '../../calendar-strip-types';

const SWIPE_DISTANCE = 48;
const SWIPE_VELOCITY = 420;

export const travelOfSwipe = (offsetX: number, velocityX: number): KkCalendarTravel => {
  const flung = Math.abs(velocityX) >= SWIPE_VELOCITY;
  const dragged = Math.abs(offsetX) >= SWIPE_DISTANCE;

  if (!flung && !dragged) {
    return 'none';
  }

  const direction = flung ? velocityX : offsetX;

  return direction < 0 ? 'later' : 'earlier';
};

export const slideOffsetOf = (travel: KkCalendarTravel, leaving: boolean): string => {
  if (travel === 'none') {
    return '0%';
  }

  const forward = travel === 'later' ? 1 : -1;
  const side = leaving ? -forward : forward;

  return `${side * 38}%`;
};

const PULL_VELOCITY = 500;

export const pullOf = (offsetY: number, velocityY: number, threshold: number): KkCalendarPull => {
  const flung = Math.abs(velocityY) >= PULL_VELOCITY;
  const pulled = Math.abs(offsetY) >= threshold;

  if (!flung && !pulled) {
    return 'none';
  }

  const direction = pulled ? offsetY : velocityY;

  return direction > 0 ? 'open' : 'close';
};
