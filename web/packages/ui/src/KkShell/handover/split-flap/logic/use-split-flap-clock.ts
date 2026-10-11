import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { ramp } from '../../../../internal/ramp';
import type { SplitFlapWindow } from './split-flap-flaps';

export const useSplitFlapClock = (
  progress: MotionValue<number>,
  window: SplitFlapWindow,
): MotionValue<number> =>
  useTransform(progress, (value: number): number => ramp(value, window.start, window.end));
