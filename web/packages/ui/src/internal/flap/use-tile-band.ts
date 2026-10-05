import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { tileBandClipOf } from './flap-pose';

export const useTileBand = (presence: MotionValue<number> | number): MotionValue<string> =>
  useTransform(() => tileBandClipOf(typeof presence === 'number' ? presence : presence.get()));
