import { describe, expect, it } from 'vitest';
import type { ActScreen } from './act-screens';
import { actScreenPathOf, startedHallOf, switchedEditingOf } from './act-screens';

describe('actScreenPathOf', () => {
  it.each<[ActScreen, string]>([
    [{ kind: 'practice', eventId: null }, '/acts/5/practice'],
    [{ kind: 'practice', eventId: 9 }, '/acts/5/evenings/9/practice'],
    [{ kind: 'edit', eventId: null }, '/acts/5/edit'],
    [{ kind: 'edit', eventId: 9 }, '/acts/5/evenings/9/edit'],
    [{ kind: 'music' }, '/acts/5/music'],
    [{ kind: 'videos' }, '/acts/5/videos'],
    [{ kind: 'freeHall' }, '/acts/5/training'],
    [{ kind: 'training', trainingId: 4 }, '/acts/5/trainings/4'],
    [{ kind: 'stepSetup' }, '/acts/5/steps/setup'],
  ])('%o lives at %s', (screen, expected) => {
    expect(actScreenPathOf(5, screen)).toBe(expected);
  });
});

describe('switchedEditingOf', () => {
  it.each<[ActScreen, ActScreen]>([
    [
      { kind: 'practice', eventId: 9 },
      { kind: 'edit', eventId: 9 },
    ],
    [
      { kind: 'edit', eventId: null },
      { kind: 'practice', eventId: null },
    ],
    [{ kind: 'music' }, { kind: 'music' }],
  ])('switches %o to %o', (screen, expected) => {
    expect(switchedEditingOf(screen)).toEqual(expected);
  });
});

describe('startedHallOf', () => {
  const training = (calendarEntryId: number, startsAt: string) => ({
    calendarEntryId,
    title: 'Training',
    startsAt,
    openSpotIds: [],
  });

  it.each<[string, ReturnType<typeof training>[], ActScreen]>([
    ['runs the free hall without trainings', [], { kind: 'freeHall' }],
    [
      'runs the earliest training',
      [training(7, '2026-11-12T18:00:00+00:00'), training(4, '2026-11-10T18:00:00+00:00')],
      { kind: 'training', trainingId: 4 },
    ],
  ])('%s', (_case, trainings, expected) => {
    expect(startedHallOf(trainings)).toEqual(expected);
  });
});
