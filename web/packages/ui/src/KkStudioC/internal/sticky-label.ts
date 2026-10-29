import type { CSSProperties } from 'react';

export const SHIFT_PROPERTY = '--kk-studio-c-shift';

const STICKY_INSET = '1.75rem';
const END_ROOM = '1rem';

export type KkStudioCShiftStyle = CSSProperties & Record<typeof SHIFT_PROPERTY, string>;

export const shiftStyleOf = (width: number, shift: number): KkStudioCShiftStyle => ({
  width,
  transform: `translate3d(${shift}px, 0, 0)`,
  [SHIFT_PROPERTY]: `${shift}px`,
});

export const stickyLabelOf = (left: number, width: number): CSSProperties => ({
  transform: `translateX(clamp(0px, calc(${STICKY_INSET} - var(${SHIFT_PROPERTY}, 0px) - ${left}px), calc(${width}px - 100% - ${END_ROOM})))`,
});
