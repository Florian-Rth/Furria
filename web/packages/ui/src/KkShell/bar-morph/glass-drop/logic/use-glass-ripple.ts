import { animate } from 'motion/react';
import type { RefObject } from 'react';
import { useEffect, useRef } from 'react';
import type { GlassWave } from './glass-drop-text';
import { rippleFrameAt } from './glass-drop-text';

export interface GlassRippleNodes {
  turbulence: RefObject<SVGFETurbulenceElement | null>;
  displacement: RefObject<SVGFEDisplacementMapElement | null>;
  blur: RefObject<SVGFEGaussianBlurElement | null>;
}

export const useGlassRipple = (wave: GlassWave): GlassRippleNodes => {
  const turbulence = useRef<SVGFETurbulenceElement>(null);
  const displacement = useRef<SVGFEDisplacementMapElement>(null);
  const blur = useRef<SVGFEGaussianBlurElement>(null);

  useEffect(() => {
    const paint = (progress: number): void => {
      const frame = rippleFrameAt(wave, progress);
      turbulence.current?.setAttribute('baseFrequency', frame.frequency);
      displacement.current?.setAttribute('scale', String(frame.scale));
      blur.current?.setAttribute('stdDeviation', String(frame.deviation));
    };

    const controls = animate(0, 1, {
      duration: wave.duration,
      delay: wave.delay,
      ease: 'easeOut',
      onUpdate: paint,
    });

    return () => controls.stop();
  }, [wave]);

  return { turbulence, displacement, blur };
};
