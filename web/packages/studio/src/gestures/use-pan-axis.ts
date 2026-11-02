import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import { animate, useMotionValue, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { PanBounds } from './pan-bounds';
import { clampToBounds, momentumOf, rubberFollow } from './pan-bounds';

export interface PanAxis {
  value: MotionValue<number>;
  grab: () => void;
  follow: (delta: number) => void;
  release: (velocityPerMs: number) => void;
  jumpTo: (position: number) => void;
}

interface UsePanAxisOptions {
  bounds: PanBounds;
  dimension: number;
  initial?: number;
}

export const usePanAxis = ({ bounds, dimension, initial = 0 }: UsePanAxisOptions): PanAxis => {
  const value = useMotionValue(initial);
  const raw = useRef(initial);
  const glide = useRef<AnimationPlaybackControls | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  const stop = (): void => {
    glide.current?.stop();
    glide.current = null;
  };

  const grab = (): void => {
    stop();
    raw.current = value.get();
  };

  const follow = (delta: number): void => {
    if (glide.current !== null) {
      grab();
    }
    raw.current += delta;
    value.jump(rubberFollow(raw.current, bounds, dimension));
  };

  const jumpTo = (position: number): void => {
    stop();
    raw.current = clampToBounds(position, bounds);
    value.jump(raw.current);
  };

  const release = (velocityPerMs: number): void => {
    stop();
    if (reducedMotion) {
      jumpTo(value.get());
      return;
    }
    glide.current = animate(value, value.get(), {
      type: 'inertia',
      ...momentumOf(velocityPerMs, bounds),
    });
  };

  useEffect(() => () => glide.current?.stop(), []);

  return { value, grab, follow, release, jumpTo };
};
