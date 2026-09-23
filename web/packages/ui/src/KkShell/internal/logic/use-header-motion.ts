import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { KkScreenHeaderKind } from '../../screen-declaration';
import { handoverAt } from './handover';
import { headerMotionOf } from './header-motion';
import { useKkShellScroll } from './shell-scroll';

export interface KkHeaderMotionValues {
  opacity: MotionValue<number>;
  drift: MotionValue<number>;
}

export const useHeaderMotion = (kind: KkScreenHeaderKind): KkHeaderMotionValues => {
  const { scrollY, motion } = useKkShellScroll();

  const opacityAt = (scrollOffset: number): number =>
    headerMotionOf(kind, handoverAt(scrollOffset, motion)).opacity;
  const driftAt = (scrollOffset: number): number =>
    headerMotionOf(kind, handoverAt(scrollOffset, motion)).drift;

  return {
    opacity: useTransform(scrollY, opacityAt),
    drift: useTransform(scrollY, driftAt),
  };
};
