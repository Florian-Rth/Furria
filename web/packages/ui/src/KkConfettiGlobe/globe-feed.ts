import type { KkGravity } from './globe-tilt';
import { KK_UPRIGHT } from './globe-tilt';

export type KkGlobeSignal = 'tilt' | 'shake';

export type KkGlobeListener = (signal: KkGlobeSignal) => void;

export interface KkGlobeFeed {
  readonly gravity: () => KkGravity;
  readonly tilt: (gravity: KkGravity) => void;
  readonly shake: () => void;
  readonly listen: (listener: KkGlobeListener) => () => void;
}

export const createKkGlobeFeed = (): KkGlobeFeed => {
  const listeners = new Set<KkGlobeListener>();
  let current: KkGravity = KK_UPRIGHT;
  const tell = (signal: KkGlobeSignal): void => {
    for (const listener of listeners) {
      listener(signal);
    }
  };

  return {
    gravity: () => current,
    tilt: (gravity) => {
      current = gravity;
      tell('tilt');
    },
    shake: () => {
      tell('shake');
    },
    listen: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
