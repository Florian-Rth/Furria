import { describe, expect, it } from 'vitest';
import { CHANGELOG_ENTRIES, sortEntriesByDateDesc } from './changelog-content';
import { CHANGELOG_ICONS } from './changelog-icons';
import type { ChangelogEntry } from './schemas';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'newspaper',
  description: ['Absatz'],
});

describe('CHANGELOG_ENTRIES', () => {
  it('parses the shipped content file', () => {
    expect(CHANGELOG_ENTRIES.length).toBeGreaterThan(0);
  });

  it('gives every entry a unique id, since the id is also the read-state key', () => {
    const ids = CHANGELOG_ENTRIES.map((changelogEntry) => changelogEntry.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names only icons the allow-map can resolve', () => {
    for (const changelogEntry of CHANGELOG_ENTRIES) {
      expect(CHANGELOG_ICONS[changelogEntry.icon]).toBeDefined();
    }
  });
});

describe('sortEntriesByDateDesc', () => {
  it('sorts newest first regardless of the order in the file', () => {
    const sorted = sortEntriesByDateDesc([
      entry('oldest', '2026-07-20'),
      entry('newest', '2026-07-26'),
      entry('middle', '2026-07-23'),
    ]);

    expect(sorted.map((sortedEntry) => sortedEntry.id)).toEqual(['newest', 'middle', 'oldest']);
  });

  it('leaves the input array untouched', () => {
    const entries = [entry('oldest', '2026-07-20'), entry('newest', '2026-07-26')];

    sortEntriesByDateDesc(entries);

    expect(entries.map((untouched) => untouched.id)).toEqual(['oldest', 'newest']);
  });

  it('puts the newest shipped entry first even though the file appends it last', () => {
    const sorted = sortEntriesByDateDesc(CHANGELOG_ENTRIES);
    const lastInFile = CHANGELOG_ENTRIES.at(-1);

    expect(sorted[0]).toBe(lastInFile);
  });

  it('handles an empty log', () => {
    expect(sortEntriesByDateDesc([])).toEqual([]);
  });
});
