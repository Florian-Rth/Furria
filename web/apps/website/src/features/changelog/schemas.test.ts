import { describe, expect, it } from 'vitest';
import { ChangelogEntrySchema } from './schemas';

const validEntry = {
  id: 'website-p4-news-fe',
  date: '2026-07-26',
  title: 'Aktuelles',
  icon: 'newspaper',
  description: ['Erster Absatz.'],
};

describe('ChangelogEntrySchema', () => {
  it('accepts only icons the allow-map can resolve', () => {
    expect(ChangelogEntrySchema.safeParse(validEntry).success).toBe(true);
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, icon: 'rocket' }).success).toBe(false);
  });

  it('rejects a date that is not an ISO calendar date', () => {
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, date: '26.07.2026' }).success).toBe(
      false,
    );
  });
});
