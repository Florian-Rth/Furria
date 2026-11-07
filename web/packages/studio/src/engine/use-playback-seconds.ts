import type { MotionValue } from 'motion/react';
import { useMotionValue } from 'motion/react';
import { useEffect, useSyncExternalStore } from 'react';
import type { MixPlayer } from './mix-player';

interface FrameStore {
  subscribe: (listener: () => void) => () => void;
  seconds: () => number;
  steer: (seconds: number | null) => void;
}

const frameStores = new WeakMap<MixPlayer, FrameStore>();

const createFrameStore = (player: MixPlayer): FrameStore => {
  const listeners = new Set<() => void>();
  let steered: number | null = null;
  let seconds = player.position();
  let frame: number | null = null;
  let unsubscribePlayer: (() => void) | null = null;

  const shownSeconds = (): number => steered ?? player.position();

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const tick = (): void => {
    seconds = shownSeconds();
    notify();
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
      seconds = shownSeconds();
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
    steer: (wanted) => {
      if (wanted === steered) {
        return;
      }
      steered = wanted;
      seconds = shownSeconds();
      notify();
    },
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

export const steerPlayback = (player: MixPlayer, seconds: number | null): void => {
  frameStoreOf(player).steer(seconds);
};

export const usePlaybackText = (
  player: MixPlayer,
  format: (seconds: number) => string,
): MotionValue<string> => {
  const store = frameStoreOf(player);
  const text = useMotionValue(format(store.seconds()));

  useEffect(() => {
    const show = (): void => {
      text.set(format(store.seconds()));
    };
    const unsubscribe = store.subscribe(show);
    show();

    return unsubscribe;
  }, [store, text, format]);

  return text;
};
