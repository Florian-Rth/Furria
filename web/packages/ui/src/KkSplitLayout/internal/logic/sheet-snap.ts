export type SheetSnap = 'open' | 'closed';

const FLING_VELOCITY = 420;

export const resolveSheetSnap = (offsetY: number, velocityY: number, travel: number): SheetSnap => {
  if (velocityY > FLING_VELOCITY) {
    return 'closed';
  }
  if (velocityY < -FLING_VELOCITY) {
    return 'open';
  }
  return offsetY > travel / 2 ? 'closed' : 'open';
};
