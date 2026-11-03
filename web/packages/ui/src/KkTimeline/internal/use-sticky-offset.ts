import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { stickyOffsetOf } from './sticky-name';

export const useStickyOffset = (
  panX: MotionValue<number> | null,
  bandLeft: number,
  room: MotionValue<number>,
): MotionValue<number> =>
  useTransform(() => (panX === null ? 0 : stickyOffsetOf(panX.get(), bandLeft, room.get())));
