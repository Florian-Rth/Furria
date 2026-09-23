import type { MotionValue } from 'motion/react';
import { useMotionValue } from 'motion/react';
import type { TuschFrame } from './tusch-score';

export type TuschValues = Record<keyof TuschFrame, MotionValue<number>>;

const FRAME_KEYS: readonly (keyof TuschFrame)[] = [
  'copyOpacity',
  'copyX',
  'copyY',
  'copyScale',
  'copyShadowX',
  'copyShadowY',
  'copyShadowOpacity',
  'restOpacity',
  'restX',
  'restY',
  'restRotate',
  'restScale',
  'titleOpacity',
  'titleScale',
  'inkOpacity',
  'inkOffset',
  'flashOpacity',
  'glow',
  'chromeScale',
];

export const applyFrame = (values: TuschValues, frame: TuschFrame): void => {
  for (const key of FRAME_KEYS) {
    values[key].set(frame[key]);
  }
};

export const useTuschValues = (docked: boolean): TuschValues => ({
  copyOpacity: useMotionValue(0),
  copyX: useMotionValue(0),
  copyY: useMotionValue(0),
  copyScale: useMotionValue(1),
  copyShadowX: useMotionValue(0),
  copyShadowY: useMotionValue(0),
  copyShadowOpacity: useMotionValue(0),
  restOpacity: useMotionValue(docked ? 0 : 1),
  restX: useMotionValue(0),
  restY: useMotionValue(0),
  restRotate: useMotionValue(0),
  restScale: useMotionValue(1),
  titleOpacity: useMotionValue(docked ? 1 : 0),
  titleScale: useMotionValue(1),
  inkOpacity: useMotionValue(0),
  inkOffset: useMotionValue(0),
  flashOpacity: useMotionValue(0),
  glow: useMotionValue(0),
  chromeScale: useMotionValue(1),
});
