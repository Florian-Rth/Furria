import { describe, expect, it } from 'vitest';
import type { StudioEvening, StudioTraining } from '@/features/acts/schemas';
import { actEveningsOf, nextEveningOf, nextTrainingOf } from './score-season';

const NOW = Date.parse('2026-11-01T12:00:00Z');

const training = (calendarEntryId: number, startsAt: string): StudioTraining => ({
  calendarEntryId,
  title: 'Training',
  startsAt,
  openSpotIds: [],
  responses: [],
});

const evening = (
  eventId: number,
  startsAt: string,
  position: number | null | 'out',
): StudioEvening => ({
  eventId,
  title: 'Abend',
  startsAt,
  appearance:
    position === 'out'
      ? null
      : {
          appearanceId: eventId,
          position,
          added: [],
          removedPersonIds: [],
          spotChanges: [],
          choreography: null,
        },
});

describe('actEveningsOf', () => {
  it('lists only coming evenings the act is in, by date, numbered from one', () => {
    const evenings = actEveningsOf(
      [
        evening(1, '2026-12-11T18:00:00Z', 4),
        evening(2, '2026-11-20T18:00:00Z', 'out'),
        evening(3, '2026-10-20T18:00:00Z', 0),
        evening(4, '2026-11-11T10:00:00Z', null),
      ],
      NOW,
    );

    expect(evenings.map((entry) => [entry.eventId, entry.number])).toEqual([
      [4, null],
      [1, 5],
    ]);
  });
});

describe('next', () => {
  it('picks the earliest training still running or ahead', () => {
    const trainings = [
      training(1, '2026-11-05T18:00:00Z'),
      training(2, '2026-11-01T11:00:00Z'),
      training(3, '2026-10-30T18:00:00Z'),
    ];

    expect(nextTrainingOf(trainings, NOW)?.calendarEntryId).toBe(2);
  });

  it('picks the next evening the act is part of', () => {
    const evenings = [
      evening(1, '2026-11-20T18:00:00Z', 2),
      evening(2, '2026-11-10T18:00:00Z', 'out'),
      evening(3, '2026-10-20T18:00:00Z', 1),
    ];

    expect(nextEveningOf(evenings, NOW)?.eventId).toBe(1);
  });
});
