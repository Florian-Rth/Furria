import type { MotionValue } from 'motion/react';
import { useMotionValue } from 'motion/react';

export interface DockValues {
  flightOpacity: MotionValue<number>;
  headlineX: MotionValue<number>;
  headlineY: MotionValue<number>;
  headlineScale: MotionValue<number>;
  restOpacity: MotionValue<number>;
  restX: MotionValue<number>;
  restY: MotionValue<number>;
  titleOpacity: MotionValue<number>;
  titleScaleX: MotionValue<number>;
  titleScaleY: MotionValue<number>;
}

export const useDockValues = (): DockValues => ({
  flightOpacity: useMotionValue(0),
  headlineX: useMotionValue(0),
  headlineY: useMotionValue(0),
  headlineScale: useMotionValue(1),
  restOpacity: useMotionValue(1),
  restX: useMotionValue(0),
  restY: useMotionValue(0),
  titleOpacity: useMotionValue(0),
  titleScaleX: useMotionValue(1),
  titleScaleY: useMotionValue(1),
});
