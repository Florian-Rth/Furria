import { useEffect, useState } from 'react';
import { KK_PRESS_BEATS_MS } from './press-beats';

export type RainState = 'dry' | 'raining' | 'fading';

export const useRainWindow = (fireKey: number): RainState => {
  const [rain, setRain] = useState<RainState>('dry');

  useEffect(() => {
    if (fireKey === 0) {
      return;
    }
    setRain('raining');
    const fade = window.setTimeout(() => {
      setRain('fading');
    }, KK_PRESS_BEATS_MS.rain);
    const stop = window.setTimeout(() => {
      setRain('dry');
    }, KK_PRESS_BEATS_MS.rain + KK_PRESS_BEATS_MS.rainFade);
    return () => {
      window.clearTimeout(fade);
      window.clearTimeout(stop);
    };
  }, [fireKey]);

  return rain;
};
