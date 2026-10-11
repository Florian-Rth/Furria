import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { SplitFlapCell } from './split-flap-flaps';
import { cellOffsetAt } from './split-flap-flaps';

export const useSplitFlapOffset = (
  clock: MotionValue<number>,
  cell: SplitFlapCell,
): MotionValue<number> => useTransform(clock, (value: number): number => cellOffsetAt(cell, value));
