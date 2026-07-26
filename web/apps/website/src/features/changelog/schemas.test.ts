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
  it('accepts a well-formed entry', () => {
    expect(ChangelogEntrySchema.safeParse(validEntry).success).toBe(true);
  });

  it('rejects an icon that is not in the allow-map', () => {
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, icon: 'rocket' }).success).toBe(false);
  });

  it('rejects a missing field', () => {
    const withoutTitle = {
      id: validEntry.id,
      date: validEntry.date,
      icon: validEntry.icon,
      description: validEntry.description,
    };

    expect(ChangelogEntrySchema.safeParse(withoutTitle).success).toBe(false);
  });

  it('rejects a date that is not an ISO calendar date', () => {
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, date: '26.07.2026' }).success).toBe(
      false,
    );
  });

  it('rejects an empty description', () => {
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, description: [] }).success).toBe(false);
  });

  it('rejects a blank paragraph', () => {
    expect(ChangelogEntrySchema.safeParse({ ...validEntry, description: [''] }).success).toBe(
      false,
    );
  });
});
