import { describe, expect, it } from 'vitest';
import { sortEntriesByDateDesc } from './changelog-content';
import type { ChangelogEntry } from './schemas';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'newspaper',
  description: ['Absatz'],
});

describe('sortEntriesByDateDesc', () => {
  it('sorts a copy of the log, newest first', () => {
    const entries = [
      entry('oldest', '2026-07-20'),
      entry('newest', '2026-07-26'),
      entry('middle', '2026-07-23'),
    ];

    expect(sortEntriesByDateDesc(entries).map((sorted) => sorted.id)).toEqual([
      'newest',
      'middle',
      'oldest',
    ]);
    expect(entries.map((untouched) => untouched.id)).toEqual(['oldest', 'newest', 'middle']);
  });

  it('handles an empty log', () => {
    expect(sortEntriesByDateDesc([])).toEqual([]);
  });
});
