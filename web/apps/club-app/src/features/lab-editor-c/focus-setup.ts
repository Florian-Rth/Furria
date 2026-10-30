import type { Studio } from '@/features/acts/schemas';

export type SetupTask = 'music' | 'steps' | 'spots' | 'formation' | 'video' | 'final';
export type SetupState = 'done' | 'next' | 'later';

export const SETUP_ORDER: readonly SetupTask[] = [
  'music',
  'steps',
  'spots',
  'formation',
  'video',
  'final',
];

export interface SetupSource {
  songs: number;
  finalAdopted: boolean;
  timedSteps: number;
  spots: number;
  keyframes: number;
  videos: number;
}

export interface SetupItem {
  task: SetupTask;
  number: number;
  state: SetupState;
}

export interface SetupProgress {
  items: SetupItem[];
  done: number;
  total: number;
  next: SetupTask | null;
  complete: boolean;
}

const doneOf = (source: SetupSource, task: SetupTask): boolean => {
  switch (task) {
    case 'music':
      return source.songs > 0 || source.finalAdopted;
    case 'steps':
      return source.timedSteps > 0;
    case 'spots':
      return source.spots > 0;
    case 'formation':
      return source.keyframes > 0;
    case 'video':
      return source.videos > 0;
    case 'final':
      return source.finalAdopted;
  }
};

export const setupSourceOf = (studio: Studio): SetupSource => ({
  songs: studio.songs.length,
  finalAdopted: studio.finalTracks.some((track) => track.adopted),
  timedSteps: studio.steps.filter((step) => step.startSeconds !== null).length,
  spots: studio.spots.length,
  keyframes: (studio.choreography?.tracks ?? []).reduce(
    (sum, track) => sum + track.keyframes.length,
    0,
  ),
  videos: studio.videos.length,
});

export const setupProgressOf = (source: SetupSource): SetupProgress => {
  const finished = SETUP_ORDER.filter((task) => doneOf(source, task));
  const next = SETUP_ORDER.find((task) => !doneOf(source, task)) ?? null;

  return {
    items: SETUP_ORDER.map((task, index) => {
      const state: SetupState = doneOf(source, task) ? 'done' : task === next ? 'next' : 'later';

      return { task, number: index + 1, state };
    }),
    done: finished.length,
    total: SETUP_ORDER.length,
    next,
    complete: next === null,
  };
};

export const setupStateOf = (progress: SetupProgress, task: SetupTask): SetupState =>
  progress.items.find((item) => item.task === task)?.state ?? 'later';
