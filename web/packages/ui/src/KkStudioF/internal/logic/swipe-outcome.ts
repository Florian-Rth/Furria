export type KkStudioFSwipeOutcome = 'next' | 'previous' | 'stay';

const COMMIT_SHARE = 0.18;
const FLICK_DISTANCE = 24;
const FLICK_SPEED = 0.45;
const HORIZONTAL_DOMINANCE = 1.2;
const EDGE_RESISTANCE = 0.25;

export interface KkStudioFSwipe {
  dx: number;
  dy: number;
  width: number;
  milliseconds: number;
}

export const swipeOutcomeOf = ({
  dx,
  dy,
  width,
  milliseconds,
}: KkStudioFSwipe): KkStudioFSwipeOutcome => {
  if (Math.abs(dx) < Math.abs(dy) * HORIZONTAL_DOMINANCE) {
    return 'stay';
  }

  const speed = milliseconds > 0 ? Math.abs(dx) / milliseconds : 0;
  const committed =
    Math.abs(dx) >= width * COMMIT_SHARE ||
    (Math.abs(dx) >= FLICK_DISTANCE && speed >= FLICK_SPEED);

  if (!committed) {
    return 'stay';
  }

  return dx < 0 ? 'next' : 'previous';
};

export const dragOffsetOf = (dx: number, canPrevious: boolean, canNext: boolean): number => {
  const blocked = (dx < 0 && !canNext) || (dx > 0 && !canPrevious);

  return blocked ? dx * EDGE_RESISTANCE : dx;
};
