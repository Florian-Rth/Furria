import type { MotionValue } from 'motion/react';
import { useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import { headerFoldAt, headerTravelAt } from './fallblatt-flaps';

export interface FallblattHeaderFoldMotion {
  rotateX: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
}

export const useFallblattHeaderFold = (): FallblattHeaderFoldMotion => {
  const { scrollY } = useScroll();
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
