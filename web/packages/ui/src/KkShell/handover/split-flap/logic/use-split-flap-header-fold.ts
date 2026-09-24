import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import { useKkShellScroll } from '../../../internal/logic/shell-scroll';
import { headerFoldAt, headerTravelAt } from './split-flap-flaps';

export interface SplitFlapHeaderFoldMotion {
  rotateX: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
}

export const useSplitFlapHeaderFold = (): SplitFlapHeaderFoldMotion => {
  const { scrollY } = useKkShellScroll();
  const reduced = useReducedMotion();
  const travelled = useTransform(scrollY, (offset: number): number =>
    headerTravelAt(offset, reduced),
  );

  return {
    rotateX: useTransform(travelled, (value: number): number => headerFoldAt(value).tilt),
    y: useTransform(travelled, (value: number): number => headerFoldAt(value).hold),
    scale: useTransform(travelled, (value: number): number => headerFoldAt(value).scale),
    opacity: useTransform(travelled, (value: number): number => headerFoldAt(value).opacity),
  };
};
