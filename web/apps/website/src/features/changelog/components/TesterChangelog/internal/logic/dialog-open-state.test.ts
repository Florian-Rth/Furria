import { describe, expect, it } from 'vitest';
import type { ChangelogEntry } from '@/features/changelog/schemas';
import {
  resolveDialogInit,
  withDialogClosed,
  withDialogOpened,
  withEntryListRestored,
  withEntrySelected,
} from './dialog-open-state';

const entry = (id: string, date: string): ChangelogEntry => ({
  id,
  date,
  title: id,
  icon: 'palette',
  description: ['Text'],
});

describe('resolveDialogInit', () => {
  it('stays closed without a selection when there are no entries', () => {
    expect(resolveDialogInit([], true)).toEqual({
      open: false,
      selectedEntryId: null,
      mobileView: 'list',
    });
  });

  it('opens on the newest entry when the newest entry is unread', () => {
    const entries = [entry('newest', '2026-07-26'), entry('older', '2026-07-20')];

    expect(resolveDialogInit(entries, true)).toEqual({
      open: true,
      selectedEntryId: 'newest',
      mobileView: 'list',
    });
  });

  it('preselects the newest entry but stays closed when the newest entry is read', () => {
    const entries = [entry('newest', '2026-07-26'), entry('older', '2026-07-20')];

    expect(resolveDialogInit(entries, false)).toEqual({
      open: false,
      selectedEntryId: 'newest',
      mobileView: 'list',
    });
  });
});

describe('withEntrySelected', () => {
  it('selects the entry and moves to the detail view', () => {
    const state = resolveDialogInit([entry('newest', '2026-07-26')], false);

    expect(withEntrySelected(state, 'older')).toEqual({
      open: true,
      selectedEntryId: 'older',
      mobileView: 'detail',
    });
  });
});

describe('withEntryListRestored', () => {
  it('returns to the list without dropping the selection', () => {
    const detail = withEntrySelected(resolveDialogInit([entry('a', '2026-07-26')], true), 'a');

    expect(withEntryListRestored(detail)).toEqual({
      open: true,
      selectedEntryId: 'a',
      mobileView: 'list',
    });
  });
});

describe('withDialogOpened', () => {
  it('reopens on the list even when a detail view was left behind', () => {
    const closedOnDetail = withDialogClosed(
      withEntrySelected(resolveDialogInit([entry('a', '2026-07-26')], true), 'a'),
    );

    expect(withDialogOpened(closedOnDetail)).toEqual({
      open: true,
      selectedEntryId: 'a',
      mobileView: 'list',
    });
  });
});

describe('withDialogClosed', () => {
  it('closes without discarding the selection', () => {
    const state = resolveDialogInit([entry('a', '2026-07-26')], true);

    expect(withDialogClosed(state)).toEqual({
      open: false,
      selectedEntryId: 'a',
      mobileView: 'list',
    });
  });
});
