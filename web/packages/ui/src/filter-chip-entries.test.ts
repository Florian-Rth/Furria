import { describe, expect, it } from 'vitest';
import type { KkFilterOption } from './filter-chip-entries';
import { toFilterChipEntries } from './filter-chip-entries';

const options: KkFilterOption[] = [
  { id: 'all', label: 'Alle', count: 152 },
  { id: 'active', label: 'Aktiv', count: 134, tone: 'gold' },
  { id: 'ended', label: 'Beendet', count: 0 },
  { id: 'open', label: 'Offen', count: 7, countFirst: true },
];

describe('toFilterChipEntries', () => {
  it('writes the real count next to every label', () => {
    expect(toFilterChipEntries(options, 'all').map((entry) => entry.text)).toEqual([
      'Alle 152',
      'Aktiv 134',
      'Beendet 0',
      '7 Offen',
    ]);
  });

  it('marks exactly the option the caller selected', () => {
    const entries = toFilterChipEntries(options, 'active');

    expect(entries.filter((entry) => entry.selected).map((entry) => entry.id)).toEqual(['active']);
  });

  it('selects nothing when the value belongs to no option', () => {
    expect(toFilterChipEntries(options, 'roles').some((entry) => entry.selected)).toBe(false);
  });

  it('carries a tone only for the options that asked for one', () => {
    expect(toFilterChipEntries(options, 'all').map((entry) => entry.tone)).toEqual([
      undefined,
      'gold',
      undefined,
      undefined,
    ]);
  });

  it('carries the id through untouched so the callback answers with it', () => {
    expect(toFilterChipEntries(options, 'all').map((entry) => entry.id)).toEqual([
      'all',
      'active',
      'ended',
      'open',
    ]);
  });
});
