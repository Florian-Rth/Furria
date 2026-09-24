import type { MotionValue } from 'motion/react';
import { animate, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';

export interface SplitFlapGlint {
  host: HTMLElement | null;
  sweepX: MotionValue<string>;
  sweepOpacity: MotionValue<number>;
}

const CHROME_SELECTOR = '[data-kk-chrome]';
const SWEEP_FROM = -140;
const SWEEP_TO = 480;
const SWEEP = { duration: 1.2, ease: [0.32, 0, 0.18, 1] } as const;

const sweepXAt = (sweep: number): string => `${SWEEP_FROM + (SWEEP_TO - SWEEP_FROM) * sweep}%`;
const sweepOpacityAt = (sweep: number): number => Math.sin(Math.PI * sweep);

export const useSplitFlapGlint = (
  stageRef: RefObject<HTMLDivElement | null>,
  progress: MotionValue<number>,
): SplitFlapGlint => {
  const reduced = useReducedMotion();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const sweep = useMotionValue(0);
  const landedRef = useRef(progress.get() >= 1);
  const sweepX = useTransform(sweep, sweepXAt);
  const sweepOpacity = useTransform(sweep, sweepOpacityAt);

  useLayoutEffect(() => {
    const chrome = stageRef.current?.closest(CHROME_SELECTOR);
    setHost(chrome instanceof HTMLElement ? chrome : null);
  }, [stageRef]);

  useMotionValueEvent(progress, 'change', (value) => {
    const landed = value >= 1;

    if (landed && !landedRef.current && !reduced) {
      void animate(sweep, [0, 1], SWEEP);
    }

    landedRef.current = landed;
  });

  return { host, sweepX, sweepOpacity };
};
