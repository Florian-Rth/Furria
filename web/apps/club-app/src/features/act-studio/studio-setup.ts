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

const OPTIONAL_KEYS: ReadonlySet<SetupKey> = new Set<SetupKey>(['video', 'final']);

export interface SetupRow {
  key: SetupKey;
  number: number;
  state: SetupState;
  optional: boolean;
  ready: boolean;
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
  ready: boolean;
  amount: number;
  open: number;
}

interface SetupFacts {
  songs: number;
  timedSteps: number;
  spots: number;
  openSpots: number;
  placedSpots: number;
  videos: number;
  finals: number;
  waitingFinals: number;
  finalAdopted: boolean;
}

const isReady = (item: { state: string }): boolean => item.state === 'ready';

const factsOf = (studio: Studio): SetupFacts => {
  const placed = new Set(
    (studio.choreography?.tracks ?? [])
      .filter((track) => track.keyframes.length > 0)
      .map((track) => track.spotId),
  );

  const finals = studio.finalTracks.filter(isReady);

  return {
    songs: studio.songs.filter(isReady).length,
    timedSteps: studio.steps.filter(
      (step) => step.placement === 'onTimeline' && step.startSeconds !== null,
    ).length,
    spots: studio.spots.length,
    openSpots: studio.spots.filter((spot) => spot.person === null).length,
    placedSpots: studio.spots.filter((spot) => placed.has(spot.spotId)).length,
    videos: studio.videos.filter(isReady).length,
    finals: finals.length,
    waitingFinals: finals.filter((track) => !track.adopted).length,
    finalAdopted: finals.some((track) => track.adopted),
  };
};

const countOf = (facts: SetupFacts, key: SetupKey): SetupCount => {
  const audible = facts.songs > 0 || facts.finalAdopted;

  switch (key) {
    case 'music':
      return { done: audible, ready: true, amount: facts.songs, open: 0 };
    case 'steps':
      return { done: facts.timedSteps > 0, ready: audible, amount: facts.timedSteps, open: 0 };
    case 'spots':
      return { done: facts.spots > 0, ready: true, amount: facts.spots, open: facts.openSpots };
    case 'formation':
      return {
        done: facts.placedSpots > 0,
        ready: facts.spots > 0 && facts.timedSteps > 0,
        amount: facts.placedSpots,
        open: Math.max(0, facts.spots - facts.placedSpots),
      };
    case 'video':
      return { done: facts.videos > 0, ready: audible, amount: facts.videos, open: 0 };
    case 'final':
      return {
        done: facts.finalAdopted,
        ready: true,
        amount: facts.finals,
        open: facts.waitingFinals,
      };
  }
};

export const setupOf = (studio: Studio): Setup => {
  const facts = factsOf(studio);
  const counts = SETUP_ORDER.map((key) => ({
    key,
    optional: OPTIONAL_KEYS.has(key),
    ...countOf(facts, key),
  }));
  const required = counts.filter((count) => !count.optional);
  const next = required.find((count) => !count.done)?.key ?? null;

  return {
    rows: counts.map((count, index) => ({
      key: count.key,
      number: index + 1,
      state: count.done ? 'done' : count.key === next ? 'next' : 'open',
      optional: count.optional,
      ready: count.ready,
      amount: count.amount,
      open: count.open,
    })),
    done: required.filter((count) => count.done).length,
    total: required.length,
    started: counts.some((count) => count.done),
    complete: next === null,
  };
};

export const setupStartsOpen = (studio: Studio, onEvening: boolean): boolean =>
  !onEvening && !setupOf(studio).started;

export const setupShownOf = (studio: Studio, onEvening: boolean): boolean =>
  !onEvening && !setupOf(studio).complete;
