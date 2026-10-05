import type { MotionValue } from 'motion/react';
import { animate, useMotionValue } from 'motion/react';
import { useLayoutEffect, useState } from 'react';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { EyebrowCell } from './eyebrow-cells';
import { eyebrowCellsOf } from './eyebrow-cells';

export interface EyebrowFlip {
  cells: EyebrowCell[];
  progress: MotionValue<number>;
}

const FLIP_SECONDS = 0.23;

export const useEyebrowFlip = (text: string): EyebrowFlip => {
  const reduced = useReducedMotion();
  const progress = useMotionValue(1);
  const [shownText, setShownText] = useState(text);
  const [turningFrom, setTurningFrom] = useState<string | null>(null);

  if (shownText !== text) {
    setShownText(text);
    setTurningFrom(reduced ? null : shownText);
  }

  useLayoutEffect(() => {
    if (turningFrom === null) {
      return;
    }

    progress.jump(0);
    const controls = animate(progress, 1, {
      duration: FLIP_SECONDS,
      ease: 'linear',
      onComplete: () => {
        setTurningFrom(null);
      },
    });

    return () => {
      controls.stop();
    };
  }, [turningFrom, progress]);

  return { cells: eyebrowCellsOf(turningFrom, text), progress };
};
