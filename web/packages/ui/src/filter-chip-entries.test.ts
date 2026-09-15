import { describe, expect, it } from 'vitest';
import { toFilterChipEntries } from './filter-chip-entries';

const options = [
  { id: 'all', label: 'Alle', count: 152 },
  { id: 'active', label: 'Aktiv', count: 134 },
  { id: 'ended', label: 'Beendet', count: 0 },
];

describe('toFilterChipEntries', () => {
  it('writes the real count next to every label', () => {
    expect(toFilterChipEntries(options, 'all').map((entry) => entry.text)).toEqual([
      'Alle 152',
      'Aktiv 134',
      'Beendet 0',
    ]);
  });

  it('marks exactly the option the caller selected', () => {
    const entries = toFilterChipEntries(options, 'active');

    expect(entries.filter((entry) => entry.selected).map((entry) => entry.id)).toEqual(['active']);
  });

  it('selects nothing when the value belongs to no option', () => {
    expect(toFilterChipEntries(options, 'roles').some((entry) => entry.selected)).toBe(false);
  });

  it('carries the id through untouched so the callback answers with it', () => {
    expect(toFilterChipEntries(options, 'all').map((entry) => entry.id)).toEqual([
      'all',
      'active',
      'ended',
    ]);
  });
});
