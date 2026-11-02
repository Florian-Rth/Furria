import type { Studio } from '@/features/acts/schemas';
import type { ScoreStep } from './score-steps';

export type ReadinessKey = 'music' | 'steps' | 'places' | 'movement' | 'video' | 'final';
export type ReadinessState = 'done' | 'open' | 'empty';
export type ReadinessTarget = 'music' | 'editor';

export interface ReadinessItem {
  key: ReadinessKey;
  state: ReadinessState;
  done: number;
  total: number;
  target: ReadinessTarget;
}

const stateOf = (done: number, total: number): ReadinessState => {
  if (total === 0 || done === 0) {
    return 'empty';
  }

  return done >= total ? 'done' : 'open';
};

const musicOf = (studio: Studio): ReadinessItem => {
  const ready = studio.songs.filter(
    (song) => song.state === 'ready' && song.tempoBpm !== null && song.firstBeatSeconds !== null,
  ).length;

  return {
    key: 'music',
    state: stateOf(ready, studio.songs.length),
    done: ready,
    total: studio.songs.length,
    target: 'music',
  };
};

const finalOf = (studio: Studio): ReadinessItem => {
  const adopted = studio.finalTracks.some((track) => track.adopted);
  let state: ReadinessState = 'empty';

  if (adopted) {
    state = 'done';
  } else if (studio.finalTracks.length > 0) {
    state = 'open';
  }

  return {
    key: 'final',
    state,
    done: Number(adopted),
    total: 1,
    target: 'music',
  };
};

const shareItem = (
  key: ReadinessKey,
  done: number,
  total: number,
  target: ReadinessTarget,
): ReadinessItem => ({ key, state: stateOf(done, total), done, total, target });

export const readinessOf = (studio: Studio, steps: readonly ScoreStep[]): ReadinessItem[] => {
  const timed = steps.filter((step) => step.range !== null);
  const filled = studio.spots.filter((spot) => spot.person !== null).length;

  return [
    musicOf(studio),
    shareItem('steps', timed.length, steps.length, 'editor'),
    shareItem('places', filled, studio.spots.length, 'editor'),
    shareItem('movement', timed.filter((step) => step.movement).length, timed.length, 'editor'),
    shareItem('video', timed.filter((step) => step.video !== null).length, timed.length, 'music'),
    finalOf(studio),
  ];
};
