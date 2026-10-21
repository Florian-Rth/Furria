import type { KkGravity, KkShakeSample } from '@furria/ui';
import { simulateShake } from '@furria/ui';
import { useEffect } from 'react';

const SHAKE_KEY = 's';
const MAX_ROLL_DEGREES = 80;
const KEY_ROLL_DEGREES = 20;
const RADIANS = Math.PI / 180;
const HALF = 0.5;
const ROLL_KEYS: Readonly<Record<string, number>> = {
  ArrowLeft: KEY_ROLL_DEGREES,
  ArrowRight: -KEY_ROLL_DEGREES,
};

const clampRoll = (degrees: number): number =>
  Math.min(Math.max(degrees, -MAX_ROLL_DEGREES), MAX_ROLL_DEGREES);

export const useGlobeSimulator = (
  lean: (device: KkGravity) => void,
  sense: (sample: KkShakeSample) => void,
  enabled: boolean,
): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let roll = 0;
    const tilt = (degrees: number): void => {
      roll = clampRoll(degrees);
      lean({ x: -Math.sin(roll * RADIANS), y: Math.cos(roll * RADIANS) });
    };
    const onPointer = (event: PointerEvent): void => {
      tilt((HALF - event.clientX / window.innerWidth) * 2 * MAX_ROLL_DEGREES);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === SHAKE_KEY) {
        for (const sample of simulateShake(performance.now())) {
          sense(sample);
        }
        return;
      }
      const step = ROLL_KEYS[event.key];
      if (step !== undefined) {
        tilt(roll + step);
      }
    };

    window.addEventListener('pointermove', onPointer);
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('keydown', onKey);
    };
  }, [enabled, lean, sense]);
};
