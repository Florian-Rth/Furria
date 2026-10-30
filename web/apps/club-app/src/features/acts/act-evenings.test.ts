import { describe, expect, it } from 'vitest';
import { dancerToggleOf, eveningStateOf, eveningTilesOf } from './act-evenings';
import type { StudioAppearance, StudioEvening } from './schemas';

const person = (
  personId: number,
): { personId: number; firstName: string; lastName: string; portrait: null } => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'X',
  portrait: null,
});

const appearance = (patch: Partial<StudioAppearance>): StudioAppearance => ({
  appearanceId: 3,
  placed: false,
  added: [],
  removedPersonIds: [],
  spotChanges: [],
  choreography: null,
  ...patch,
});

const evening = (shown: StudioAppearance | null): StudioEvening => ({
  eventId: 5,
  title: 'Prunksitzung',
  startsAt: '2026-11-29T18:11:00+00:00',
  appearance: shown,
});

describe('eveningStateOf', () => {
  it.each([
    [null, 'open'],
    [appearance({}), 'joined'],
    [appearance({ placed: true }), 'placed'],
  ] as const)('reads %j as %s', (shown, state) => {
    expect(eveningStateOf(evening(shown))).toBe(state);
  });
});

describe('eveningTilesOf', () => {
  it('shows who sits the evening out and the stand-ins as guests', () => {
    const tiles = eveningTilesOf(
      [person(1), person(2)],
      evening(appearance({ removedPersonIds: [2], added: [person(9)] })),
    );

    expect(tiles.map((tile) => [tile.person.personId, tile.state])).toEqual([
      [1, 'in'],
      [2, 'out'],
      [9, 'guest'],
    ]);
  });
});

describe('dancerToggleOf', () => {
  it.each([
    ['in', false],
    ['out', true],
    ['guest', false],
  ] as const)('turns a %s tile into dances=%s', (state, dances) => {
    expect(dancerToggleOf({ person: person(1), state }).dances).toBe(dances);
  });
});
