import type { Studio } from '@/features/acts/schemas';

export type SetupKey = 'music' | 'steps' | 'spots' | 'formation' | 'video' | 'final';
export type SetupState = 'done' | 'next' | 'open';

export const SETUP_ORDER: readonly SetupKey[] = [
  'music',
  'steps',
  'spots',
  'formation',
  'video',
  'final',
];

export interface SetupRow {
  key: SetupKey;
  state: SetupState;
  amount: number;
  open: number;
}

export interface Setup {
  rows: SetupRow[];
  done: number;
  total: number;
  started: boolean;
  complete: boolean;
}

interface SetupCount {
  done: boolean;
  amount: number;
  open: number;
}

const countOf = (studio: Studio, key: SetupKey): SetupCount => {
  switch (key) {
    case 'music':
      return { done: studio.songs.length > 0, amount: studio.songs.length, open: 0 };
    case 'steps':
      return { done: studio.steps.length > 0, amount: studio.steps.length, open: 0 };
    case 'spots': {
      const open = studio.spots.filter((spot) => spot.person === null).length;
      return { done: studio.spots.length > 0, amount: studio.spots.length, open };
    }
    case 'formation': {
      const placed = new Set(
        (studio.choreography?.tracks ?? [])
          .filter((track) => track.keyframes.length > 0)
          .map((track) => track.spotId),
      );
      const shown = studio.spots.filter((spot) => placed.has(spot.spotId)).length;
      return {
        done: shown > 0,
        amount: shown,
        open: Math.max(0, studio.spots.length - shown),
      };
    }
    case 'video':
      return { done: studio.videos.length > 0, amount: studio.videos.length, open: 0 };
    case 'final': {
      const waiting = studio.finalTracks.filter((track) => !track.adopted).length;
      return {
        done: studio.finalTracks.some((track) => track.adopted),
        amount: studio.finalTracks.length,
        open: waiting,
      };
    }
  }
};

export const setupOf = (studio: Studio): Setup => {
  const counts = SETUP_ORDER.map((key) => ({ key, ...countOf(studio, key) }));
  const next = counts.find((count) => !count.done)?.key ?? null;
  const done = counts.filter((count) => count.done).length;

  return {
    rows: counts.map((count) => ({
      key: count.key,
      state: count.done ? 'done' : count.key === next ? 'next' : 'open',
      amount: count.amount,
      open: count.open,
    })),
    done,
    total: SETUP_ORDER.length,
    started: done > 0,
    complete: done === SETUP_ORDER.length,
  };
};
