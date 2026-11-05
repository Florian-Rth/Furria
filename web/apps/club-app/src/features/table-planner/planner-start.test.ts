import { describe, expect, it } from 'vitest';
import type { HallSummary, TablePlanSummary } from '@/features/hall-plan/schemas';
import { copySourcesOf, hallOptionsOf, newHallNameOf } from './planner-start';

const hall = (hallId: number, venueId: number, venueName: string, name: string): HallSummary => ({
  hallId,
  venueId,
  venueName,
  name,
  updatedAt: '2026-11-01T10:00:00Z',
});

const plan = (eventId: number, startsAt: string): TablePlanSummary => ({
  eventId,
  title: `Abend ${eventId}`,
  startsAt,
  hallId: 1,
  hallName: 'Turnhalle',
  tables: 4,
});

describe('hallOptionsOf', () => {
  it('lists the halls of the event venue first, then by venue and name', () => {
    const halls = [
      hall(1, 1, 'Bürgerhaus', 'Großer Saal'),
      hall(2, 2, 'Turnhalle', 'halb'),
      hall(3, 2, 'Turnhalle', 'ganz'),
      hall(4, 3, 'Alte Schule', 'Aula'),
    ];

    expect(hallOptionsOf(halls, 2).map((option) => option.hallId)).toEqual([3, 2, 4, 1]);
  });

  it('marks no hall without an event venue', () => {
    expect(hallOptionsOf([hall(1, 1, 'Bürgerhaus', 'Saal')], null)[0]?.isEventVenue).toBe(false);
  });
});

describe('copySourcesOf', () => {
  it('leaves out the event itself and lists the latest first', () => {
    const plans = [
      plan(1, '2025-01-18T18:00:00Z'),
      plan(2, '2026-01-17T18:00:00Z'),
      plan(3, '2027-01-16T18:00:00Z'),
    ];

    expect(copySourcesOf(plans, 3).map((source) => source.eventId)).toEqual([2, 1]);
  });
});

describe('newHallNameOf', () => {
  it.each([
    { name: 'the venue name when free', halls: [], venueName: 'Turnhalle', expected: 'Turnhalle' },
    {
      name: 'a counter when taken',
      halls: [hall(1, 2, 'Turnhalle', 'Turnhalle'), hall(2, 2, 'Turnhalle', 'Turnhalle 2')],
      venueName: 'Turnhalle',
      expected: 'Turnhalle 3',
    },
    {
      name: 'ignores halls of other venues',
      halls: [hall(1, 9, 'Bürgerhaus', 'Turnhalle')],
      venueName: 'Turnhalle',
      expected: 'Turnhalle',
    },
    { name: 'a fallback without a venue name', halls: [], venueName: null, expected: 'Saal' },
  ])('$name', ({ halls, venueName, expected }) => {
    expect(newHallNameOf(halls, 2, venueName)).toBe(expected);
  });
});
