import type { Studio } from '@/features/acts/schemas';

export type SetupItemKey = 'music' | 'steps' | 'spots' | 'formation' | 'video' | 'final';
export type SetupState = 'done' | 'open' | 'waiting' | 'locked';

export interface SetupItem {
  key: SetupItemKey;
  state: SetupState;
}

export interface SetupProgress {
  items: SetupItem[];
  done: number;
  total: number;
  next: SetupItemKey | null;
  started: boolean;
}

const lockedOr = (locked: boolean, state: SetupState): SetupState => (locked ? 'locked' : state);

const doneOr = (done: boolean): SetupState => (done ? 'done' : 'open');

export const setupItemsOf = (studio: Studio): SetupItem[] => {
  const hasMusic = studio.songs.length > 0 || studio.finalTracks.some((track) => track.adopted);
  const hasSteps = studio.steps.some(
    (step) => step.placement === 'onTimeline' && step.startSeconds !== null,
  );
  const hasSpots = studio.spots.length > 0;
  const hasFormation =
    studio.choreography?.tracks.some((track) => track.keyframes.length > 0) ?? false;
  const finalAdopted = studio.finalTracks.some((track) => track.adopted);
  const finalWaiting = studio.finalTracks.length > 0;

  return [
    { key: 'music', state: doneOr(hasMusic) },
    { key: 'steps', state: hasSteps ? 'done' : lockedOr(!hasMusic, 'open') },
    { key: 'spots', state: doneOr(hasSpots) },
    {
      key: 'formation',
      state: hasFormation ? 'done' : lockedOr(!hasSpots || !hasSteps, 'open'),
    },
    { key: 'video', state: studio.videos.length > 0 ? 'done' : lockedOr(!hasMusic, 'open') },
    {
      key: 'final',
      state: finalAdopted ? 'done' : lockedOr(!hasMusic, finalWaiting ? 'waiting' : 'open'),
    },
  ];
};

export const setupProgressOf = (studio: Studio): SetupProgress => {
  const items = setupItemsOf(studio);
  const done = items.filter((item) => item.state === 'done').length;

  return {
    items,
    done,
    total: items.length,
    next: items.find((item) => item.state === 'open' || item.state === 'waiting')?.key ?? null,
    started: done > 0,
  };
};
