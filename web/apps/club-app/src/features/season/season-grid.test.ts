import { describe, expect, it } from 'vitest';
import type { SeasonAct } from './schemas';
import { cellOf, eveningCountOf, readinessOf } from './season-grid';

const act: SeasonAct = {
  actId: 3,
  name: 'Marschtanz',
  kind: 'dance',
  group: null,
  castCount: 8,
  readiness: [
    { check: 'music', done: true },
    { check: 'steps', done: true },
    { check: 'formation', done: false },
    { check: 'videos', done: false },
    { check: 'finalFile', done: false },
    { check: 'cast', done: true },
  ],
  appearances: [
    { appearanceId: 10, eventId: 19, position: 4, changes: [], added: [], removed: [] },
    { appearanceId: 11, eventId: 20, position: null, changes: [], added: [], removed: [] },
    { appearanceId: 12, eventId: 21, position: 0, changes: ['cast'], added: [], removed: [] },
  ],
};

describe('readinessOf', () => {
  it('counts the done checks and names the open ones', () => {
    expect(readinessOf(act)).toEqual({
      done: 3,
      total: 6,
      ready: false,
      open: ['formation', 'videos', 'finalFile'],
    });
  });

  it('is ready when every check is done', () => {
    expect(readinessOf({ ...act, readiness: [{ check: 'cast', done: true }] }).ready).toBe(true);
  });
});

describe('cellOf', () => {
  it.each([
    [19, 'placed', 5, false],
    [20, 'tray', null, false],
    [21, 'placed', 1, true],
    [22, 'none', null, false],
  ] as const)('reads evening %i as %s', (eventId, state, number, adjusted) => {
    const cell = cellOf(act, eventId);

    expect([cell.state, cell.number, cell.adjusted]).toEqual([state, number, adjusted]);
  });
});

describe('eveningCountOf', () => {
  it('counts only the evenings the act is placed on', () => {
    expect(eveningCountOf(act)).toBe(2);
  });
});
