import { describe, expect, it } from 'vitest';
import { formatPublishedDay, isAnnouncementExpired, isAnnouncementNew } from './announcements';

describe('formatPublishedDay', () => {
  it.each([
    { publishedAt: '2026-09-20T11:11:00+02:00', expected: '20.09.2026' },
    { publishedAt: '2026-11-11T11:11:00Z', expected: '11.11.2026' },
    { publishedAt: '2027-01-02T23:59:59.999+01:00', expected: '02.01.2027' },
  ])('reads $publishedAt as $expected', ({ publishedAt, expected }) => {
    expect(formatPublishedDay(publishedAt)).toBe(expected);
  });
});

describe('isAnnouncementNew', () => {
  it.each([
    {
      case: 'nobody knows yet what the viewer has seen',
      publishedAt: '2026-09-20T11:11:00Z',
      lastSeenAnnouncementAt: undefined,
      expected: false,
    },
    {
      case: 'the viewer has never opened the board',
      publishedAt: '2019-02-01T08:00:00Z',
      lastSeenAnnouncementAt: null,
      expected: true,
    },
    {
      case: 'published after the last visit',
      publishedAt: '2026-09-20T11:11:00Z',
      lastSeenAnnouncementAt: '2026-09-19T20:00:00Z',
      expected: true,
    },
    {
      case: 'published at the very instant of the last visit',
      publishedAt: '2026-09-20T11:11:00Z',
      lastSeenAnnouncementAt: '2026-09-20T11:11:00Z',
      expected: false,
    },
    {
      case: 'published before the last visit',
      publishedAt: '2026-09-18T09:00:00Z',
      lastSeenAnnouncementAt: '2026-09-19T20:00:00Z',
      expected: false,
    },
    {
      case: 'the same instant written in two different offsets',
      publishedAt: '2026-09-20T13:11:00+02:00',
      lastSeenAnnouncementAt: '2026-09-20T11:11:00Z',
      expected: false,
    },
    {
      case: 'an offset hides a later instant behind a smaller clock reading',
      publishedAt: '2026-09-20T12:00:00+00:00',
      lastSeenAnnouncementAt: '2026-09-20T13:00:00+02:00',
      expected: true,
    },
  ])('is $expected when $case', ({ publishedAt, lastSeenAnnouncementAt, expected }) => {
    expect(isAnnouncementNew(publishedAt, lastSeenAnnouncementAt)).toBe(expected);
  });
});

describe('isAnnouncementExpired', () => {
  it.each([
    { case: 'no end is set', validUntil: null, today: '2026-09-20', expected: false },
    {
      case: 'the last valid day is today',
      validUntil: '2026-09-20',
      today: '2026-09-20',
      expected: false,
    },
    {
      case: 'the last valid day is still ahead',
      validUntil: '2026-09-21',
      today: '2026-09-20',
      expected: false,
    },
    {
      case: 'the last valid day has passed',
      validUntil: '2026-09-19',
      today: '2026-09-20',
      expected: true,
    },
    {
      case: 'the last valid day was in a past year',
      validUntil: '2025-12-31',
      today: '2026-01-01',
      expected: true,
    },
  ])('is $expected when $case', ({ validUntil, today, expected }) => {
    expect(isAnnouncementExpired(validUntil, today)).toBe(expected);
  });
});
