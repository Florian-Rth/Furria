import type { KkHsv } from '../../../internal/tone-color';

export interface KkAreaBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

const KEY_STEP = 0.02;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const hsvAtPoint = (hsv: KkHsv, box: KkAreaBox, x: number, y: number): KkHsv => ({
  h: hsv.h,
  s: box.width === 0 ? hsv.s : clamp01((x - box.left) / box.width),
  v: box.height === 0 ? hsv.v : clamp01(1 - (y - box.top) / box.height),
});

const KEY_SHIFTS: Readonly<Record<string, { s: number; v: number }>> = {
  ArrowLeft: { s: -KEY_STEP, v: 0 },
  ArrowRight: { s: KEY_STEP, v: 0 },
  ArrowUp: { s: 0, v: KEY_STEP },
  ArrowDown: { s: 0, v: -KEY_STEP },
};

export const hsvAfterKey = (hsv: KkHsv, key: string): KkHsv | null => {
  const shift = KEY_SHIFTS[key];
  if (shift === undefined) {
    return null;
  }

  return { h: hsv.h, s: clamp01(hsv.s + shift.s), v: clamp01(hsv.v + shift.v) };
};
