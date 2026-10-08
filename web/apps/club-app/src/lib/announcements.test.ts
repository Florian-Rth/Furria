import { describe, expect, it } from 'vitest';
import { isAnnouncementExpired, isAnnouncementNew } from './announcements';

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
    { case: 'no end is set', validUntil: null, expected: false },
    { case: 'the last valid day is today', validUntil: '2026-09-20', expected: false },
    { case: 'the last valid day has passed', validUntil: '2026-09-19', expected: true },
  ])('is $expected when $case', ({ validUntil, expected }) => {
    expect(isAnnouncementExpired(validUntil, '2026-09-20')).toBe(expected);
  });
});
