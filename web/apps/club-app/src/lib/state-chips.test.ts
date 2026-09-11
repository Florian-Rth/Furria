import { describe, expect, it } from 'vitest';
import { toStateFilterOptions } from './state-chips';

describe('toStateFilterOptions', () => {
  it('offers every occurring state in the club order, with the total first', () => {
    expect(toStateFilterOptions({ active: 134, paused: 12, ended: 4, none: 6 })).toEqual([
      { id: 'all', label: 'Alle', count: 156 },
      { id: 'active', label: 'aktiv', count: 134 },
      { id: 'paused', label: 'ruht', count: 12 },
      { id: 'ended', label: 'beendet', count: 4 },
      { id: 'none', label: 'kein Mitglied', count: 6 },
    ]);
  });

  it('drops the states that nobody is in', () => {
    expect(
      toStateFilterOptions({ active: 0, paused: 0, ended: 0, none: 1 }).map((option) => option.id),
    ).toEqual(['all', 'none']);
  });

  it('counts nobody as a total of zero', () => {
    expect(toStateFilterOptions({ active: 0, paused: 0, ended: 0, none: 0 })).toEqual([
      { id: 'all', label: 'Alle', count: 0 },
    ]);
  });
});
