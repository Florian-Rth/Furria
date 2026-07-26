import { describe, expect, it } from 'vitest';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import { resolveDialogInit } from './dialog-open-state';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'palette',
  description: ['Text'],
});

describe('resolveDialogInit', () => {
  it('stays closed without a selection when there are no entries', () => {
    expect(resolveDialogInit([], true)).toEqual({ open: false, selectedEntryId: null });
  });

  it('opens on the newest entry when the newest entry is unread', () => {
    const entries = [entry('newest', '2026-07-26'), entry('older', '2026-07-20')];

    expect(resolveDialogInit(entries, true)).toEqual({ open: true, selectedEntryId: 'newest' });
  });

  it('preselects the newest entry but stays closed when the newest entry is read', () => {
    const entries = [entry('newest', '2026-07-26'), entry('older', '2026-07-20')];

    expect(resolveDialogInit(entries, false)).toEqual({ open: false, selectedEntryId: 'newest' });
  });
});
