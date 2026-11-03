import { describe, expect, it } from 'vitest';
import type { StudioEvening, StudioTraining } from '@/features/acts/schemas';
import { eveningViewsOf, factsViewOf, readinessViewsOf, trainingAnswerOf } from './score-hub-views';

const trainingWith = (answer: 'yes' | 'no' | 'maybe'): StudioTraining => ({
  calendarEntryId: 1,
  title: 'Training',
  startsAt: '2026-11-04T18:00:00Z',
  openSpotIds: [],
  responses: [{ personId: 7, answer, isRecordedOnBehalf: false, recordedBy: null, trail: [] }],
});

const evening: StudioEvening = {
  eventId: 3,
  title: 'Abend',
  startsAt: '2026-11-11T19:11:00Z',
  appearance: null,
};

const opener = (): (() => void) => () => undefined;

describe('trainingAnswerOf', () => {
  it.each([
    ['yes', 7, 'yes'],
    ['no', 7, 'no'],
    ['maybe', 7, null],
    ['yes', 8, null],
    ['yes', null, null],
  ] as const)('reads a %s answer for viewer %s as %s', (answer, viewerId, expected) => {
    expect(trainingAnswerOf(trainingWith(answer), viewerId)).toBe(expected);
  });

  it('has no answer without a training', () => {
    expect(trainingAnswerOf(null, 7)).toBeNull();
  });
});

describe('factsViewOf', () => {
  it.each([
    [evening, opener, true],
    [evening, null, false],
    [null, opener, false],
  ])('opens the evening only when there is one and it may be opened', (next, open, opens) => {
    const facts = factsViewOf({ training: null, evening: next, viewerId: 7, music: null }, open);

    expect(facts.eveningOpen !== null).toBe(opens);
  });
});

describe('eveningViewsOf', () => {
  it('numbers placed evenings only and opens them only for editors', () => {
    const entries = [
      { eventId: 1, title: 'A', startsAt: '2026-11-11T19:00:00Z', number: 4 },
      { eventId: 2, title: 'B', startsAt: '2026-11-12T19:00:00Z', number: null },
    ];

    expect(eveningViewsOf(entries, null).map((view) => [view.number, view.open])).toEqual([
      ['4', null],
      [null, null],
    ]);
    expect(eveningViewsOf(entries, opener).every((view) => view.open !== null)).toBe(true);
  });
});

describe('readinessViewsOf', () => {
  it.each([
    [opener, true],
    [null, false],
  ])('opens a badge only with an opener', (open, opens) => {
    const [view] = readinessViewsOf(
      [{ key: 'music', state: 'done', done: 1, total: 1, target: 'music' }],
      open,
    );

    expect(view?.open !== null).toBe(opens);
  });
});
