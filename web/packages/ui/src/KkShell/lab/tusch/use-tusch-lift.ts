import type { MotionValue } from 'motion/react';
import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef } from 'react';
import { crossingOf, liftAt, TUSCH_THRESHOLD } from './tusch-score';

export interface TuschLiftMotion {
  hold: MotionValue<number>;
  scale: MotionValue<number>;
  visible: MotionValue<number>;
  leave: MotionValue<number>;
  shadowX: MotionValue<number>;
  shadowY: MotionValue<number>;
  shadowScale: MotionValue<number>;
  shadowOpacity: MotionValue<number>;
}

const RETURN = { duration: 0.2, ease: 'easeOut' } as const;

const holdAt = (scrollOffset: number): number => liftAt(scrollOffset).hold;
const scaleAt = (scrollOffset: number): number => liftAt(scrollOffset).scale;
const leaveAt = (scrollOffset: number): number => liftAt(scrollOffset).leaveOpacity;
const shadowXAt = (scrollOffset: number): number => liftAt(scrollOffset).shadowX;

const shadowYAt = (scrollOffset: number): number => {
  const lift = liftAt(scrollOffset);

  return lift.hold + lift.shadowY;
};

const shadowScaleAt = (scrollOffset: number): number => {
  const lift = liftAt(scrollOffset);

  return lift.scale * lift.shadowScale;
};

const shadowOpacityAt = ([scrollOffset, visible]: number[]): number =>
  liftAt(scrollOffset ?? 0).shadowOpacity * (visible ?? 0);

export const useTuschLift = (): TuschLiftMotion => {
  const { scrollY } = useScroll();
  const visible = useMotionValue(scrollY.get() >= TUSCH_THRESHOLD ? 0 : 1);
  const previousRef = useRef(scrollY.get());

  useMotionValueEvent(scrollY, 'change', (scrollOffset) => {
    const crossing = crossingOf(previousRef.current, scrollOffset);
    previousRef.current = scrollOffset;

    if (crossing === 'down') {
      visible.stop();
      visible.set(0);
    }

    if (crossing === 'up') {
      void animate(visible, 1, RETURN);
    }
  });

  return {
    hold: useTransform(scrollY, holdAt),
    scale: useTransform(scrollY, scaleAt),
    visible,
    leave: useTransform(scrollY, leaveAt),
    shadowX: useTransform(scrollY, shadowXAt),
    shadowY: useTransform(scrollY, shadowYAt),
    shadowScale: useTransform(scrollY, shadowScaleAt),
    shadowOpacity: useTransform([scrollY, visible], shadowOpacityAt),
  };
};
