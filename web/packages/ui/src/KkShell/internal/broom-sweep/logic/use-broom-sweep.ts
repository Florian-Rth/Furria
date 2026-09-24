import { animate } from 'motion/react';
import type { RefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useKkShellScroll } from '../../../internal/logic/shell-scroll';
import type { KkBarScene } from '../../logic/bar-scene';
import type { BroomSweepMode } from './broom-sweep-frame';
import { broomSweepFrameOf, durationOf } from './broom-sweep-frame';
import type { BroomSweepPlan } from './broom-sweep-plan';
import { planBroomSweep } from './broom-sweep-plan';
import { measureBroomSweep } from './measure-broom-sweep';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export interface BroomSweep {
  frameRef: RefObject<HTMLDivElement | null>;
  ghostRef: RefObject<HTMLDivElement | null>;
  plan: BroomSweepPlan | null;
  sweeping: boolean;
}

const modeOfDevice = (): BroomSweepMode =>
  window.matchMedia(REDUCED_MOTION_QUERY).matches ? 'fade' : 'sweep';

export const useBroomSweep = (scene: KkBarScene, debut: boolean): BroomSweep => {
  const { scrollY, motion } = useKkShellScroll();
  const [plan] = useState<BroomSweepPlan | null>(() =>
    !debut || scene.previous === null || scene.move === 'still'
      ? null
      : planBroomSweep({
          previous: scene.previous,
          current: scene.current,
          move: scene.move,
          scrollOffset: scrollY.get(),
          motion,
        }),
  );
  const [done, setDone] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;

    if (plan === null || frame === null) {
      return;
    }

    const geometry = measureBroomSweep(frame, ghostRef.current);
    const mode = modeOfDevice();
    let painted: readonly string[] = [];

    const paint = (progress: number): void => {
      const values = broomSweepFrameOf(progress, plan, geometry, mode);
      painted = Object.keys(values);
      for (const [name, value] of Object.entries(values)) {
        frame.style.setProperty(name, value);
      }
    };

    const clear = (): void => {
      for (const name of painted) {
        frame.style.removeProperty(name);
      }
    };

    paint(0);
    const controls = animate(0, 1, {
      duration: durationOf(mode),
      ease: 'linear',
      onUpdate: paint,
      onComplete: () => {
        clear();
        setDone(true);
      },
    });

    return () => {
      controls.stop();
      clear();
    };
  }, [plan]);

  return { frameRef, ghostRef, plan, sweeping: plan !== null && !done };
};
