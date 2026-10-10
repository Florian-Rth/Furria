import { describe, expect, it } from 'vitest';
import {
  contentPayloadOf,
  isRestorableSave,
  latestMomentOf,
  nextRetryDelayOf,
} from './news-saving';

describe('isRestorableSave', () => {
  it.each([
    { sequence: 3, newest: 3, hasNewerPending: false, restorable: true },
    { sequence: 2, newest: 3, hasNewerPending: false, restorable: false },
    { sequence: 3, newest: 3, hasNewerPending: true, restorable: false },
  ])('restores $sequence of $newest when newer pending is $hasNewerPending', (row) => {
    expect(isRestorableSave(row.sequence, row.newest, row.hasNewerPending)).toBe(row.restorable);
  });
});

describe('nextRetryDelayOf', () => {
  it.each([
    { retries: 0, delay: 3_000 },
    { retries: 4, delay: 48_000 },
    { retries: 5, delay: null },
  ])('waits $delay after $retries retries', ({ retries, delay }) => {
    expect(nextRetryDelayOf(retries)).toBe(delay);
  });
});

describe('contentPayloadOf', () => {
  it.each([
    { caption: '   ', expected: null },
    { caption: 'Foto: Anna', expected: 'Foto: Anna' },
  ])('sends caption "$caption" as $expected', ({ caption, expected }) => {
    const payload = contentPayloadOf({
      category: null,
      title: '',
      teaser: '',
      text: '',
      pictureCaption: caption,
      eventId: null,
      albumId: null,
    });
    expect(payload.pictureCaption).toBe(expected);
  });
});

describe('latestMomentOf', () => {
  it.each([
    { left: null, right: '2026-10-10T09:00:00Z', expected: '2026-10-10T09:00:00Z' },
    {
      left: '2026-10-10T10:00:00Z',
      right: '2026-10-10T09:00:00Z',
      expected: '2026-10-10T10:00:00Z',
    },
    {
      left: '2026-10-10T08:00:00Z',
      right: '2026-10-10T09:00:00Z',
      expected: '2026-10-10T09:00:00Z',
    },
    { left: null, right: null, expected: null },
  ])('picks $expected of $left and $right', ({ left, right, expected }) => {
    expect(latestMomentOf(left, right)).toBe(expected);
  });
});
