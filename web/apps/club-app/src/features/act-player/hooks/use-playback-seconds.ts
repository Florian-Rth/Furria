import { useSyncExternalStore } from 'react';
import type { MixPlayer } from '../mix-player';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  seconds: () => number;
}

const frameStores = new WeakMap<MixPlayer, FrameStore>();

const createFrameStore = (player: MixPlayer): FrameStore => {
  const listeners = new Set<() => void>();
  let seconds = player.position();
  let frame: number | null = null;
  let unsubscribePlayer: (() => void) | null = null;

  const tick = (): void => {
    seconds = player.position();
    for (const listener of listeners) {
      listener();
    }
    frame = player.state().playing ? requestAnimationFrame(tick) : null;
  };

  const wake = (): void => {
    if (frame === null) {
      tick();
    }
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      unsubscribePlayer ??= player.subscribe(wake);
      seconds = player.position();
      if (frame === null && player.state().playing) {
        frame = requestAnimationFrame(tick);
      }
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          unsubscribePlayer?.();
          unsubscribePlayer = null;
          if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
          }
        }
      };
    },
    seconds: () => seconds,
  };
};

const frameStoreOf = (player: MixPlayer): FrameStore => {
  const known = frameStores.get(player);

  if (known !== undefined) {
    return known;
  }

  const store = createFrameStore(player);
  frameStores.set(player, store);
  return store;
};

export const usePlaybackSeconds = (player: MixPlayer): number => {
  const store = frameStoreOf(player);

  return useSyncExternalStore(store.subscribe, store.seconds);
};

export const usePlaybackSelection = <T extends string | number | boolean | null>(
  player: MixPlayer,
  select: (seconds: number) => T,
): T => {
  const store = frameStoreOf(player);

  return useSyncExternalStore(store.subscribe, () => select(store.seconds()));
};
