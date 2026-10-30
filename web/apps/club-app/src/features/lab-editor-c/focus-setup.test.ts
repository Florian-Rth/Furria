import { describe, expect, it } from 'vitest';
import type { SetupSource } from './focus-setup';
import { setupProgressOf } from './focus-setup';

const empty: SetupSource = {
  songs: 0,
  finalAdopted: false,
  timedSteps: 0,
  spots: 0,
  keyframes: 0,
  videos: 0,
};

describe('setupProgressOf', () => {
  it.each([
    { name: 'empty act', source: empty, done: 0, next: 'music' },
    { name: 'music only', source: { ...empty, songs: 2 }, done: 1, next: 'steps' },
    {
      name: 'adopted final counts as music',
      source: { ...empty, finalAdopted: true },
      done: 2,
      next: 'steps',
    },
    {
      name: 'gap before spots',
      source: { ...empty, songs: 1, spots: 4, keyframes: 8 },
      done: 3,
      next: 'steps',
    },
    {
      name: 'everything but final',
      source: { ...empty, songs: 1, timedSteps: 7, spots: 4, keyframes: 8, videos: 1 },
      done: 5,
      next: 'final',
    },
  ])('$name', ({ source, done, next }) => {
    const progress = setupProgressOf(source);

    expect({ done: progress.done, next: progress.next, total: progress.total }).toEqual({
      done,
      next,
      total: 6,
    });
  });

  it('marks only the first open task as next', () => {
    const progress = setupProgressOf({ ...empty, songs: 1, spots: 3 });

    expect(progress.items.map((item) => item.state)).toEqual([
      'done',
      'next',
      'done',
      'later',
      'later',
      'later',
    ]);
  });

  it('is complete when every task is done', () => {
    const progress = setupProgressOf({
      songs: 1,
      finalAdopted: true,
      timedSteps: 3,
      spots: 2,
      keyframes: 4,
      videos: 1,
    });

    expect({ complete: progress.complete, next: progress.next }).toEqual({
      complete: true,
      next: null,
    });
  });
});
