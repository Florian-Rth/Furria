import { describe, expect, it } from 'vitest';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import type { ChangelogDialogState } from './dialog-open-state';
import { resolveDialogInit } from './dialog-open-state';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'palette',
  description: ['Text'],
});

const entries = [entry('newest', '2026-07-26'), entry('older', '2026-07-20')];

describe('resolveDialogInit', () => {
  it.each<[string, ChangelogEntry[], boolean, ChangelogDialogState]>([
    [
      'stays closed without a selection when there are no entries',
      [],
      true,
      { open: false, selectedEntryId: null, mobileView: 'list' },
    ],
    [
      'opens on the newest entry while it is unread',
      entries,
      true,
      { open: true, selectedEntryId: 'newest', mobileView: 'list' },
    ],
    [
      'preselects the newest entry but stays closed once it is read',
      entries,
      false,
      { open: false, selectedEntryId: 'newest', mobileView: 'list' },
    ],
  ])('%s', (_, subject, hasUnreadNewestEntry, state) => {
    expect(resolveDialogInit(subject, hasUnreadNewestEntry)).toEqual(state);
  });
});
