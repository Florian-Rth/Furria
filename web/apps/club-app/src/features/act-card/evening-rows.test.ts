import { describe, expect, it } from 'vitest';
import type { StudioEvening } from '@/features/acts/schemas';
import { eveningRowOf } from './evening-rows';

const evening = (eventId: number, position: number | null | undefined): StudioEvening => ({
  eventId,
  title: 'Prunksitzung',
  startsAt: '2027-01-23T19:11:00+00:00',
  appearance:
    position === undefined
      ? null
      : {
          appearanceId: 1,
          position,
          added: [],
          removedPersonIds: [],
          spotChanges: [],
          choreography: null,
        },
});

describe('eveningRowOf', () => {
  it.each([
    [evening(16, 3), 16, '4', 'accent', true],
    [evening(16, 3), 17, '4', 'ink', false],
    [evening(16, null), 17, '–', 'muted', false],
    [evening(16, undefined), 17, '–', 'muted', false],
  ] as const)('leads row %# with %s', (entry, nextId, lead, tone, current) => {
    const row = eveningRowOf(entry, nextId);

    expect([row.lead, row.leadTone, row.current]).toEqual([lead, tone, current]);
  });
});
