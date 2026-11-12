import { describe, expect, it } from 'vitest';
import { toAnnouncementLookup } from './announcement-lookup';
import type { AnnouncementsResponse } from './schemas';

const board: AnnouncementsResponse = {
  announcements: [
    {
      announcementId: 7,
      title: 'Saalreinigung',
      body: 'Samstag',
      mentions: {
        persons: [],
        groups: [],
        calendarEntries: [],
        events: [],
        newsPosts: [],
        albums: [],
      },
      publishedAt: '2026-11-12T10:00:00+00:00',
      validUntil: null,
      author: null,
      viewerMayEdit: false,
      addOns: [],
      answerCount: 0,
      viewerAnswer: null,
      viewerMayAnswer: false,
    },
  ],
};

describe('toAnnouncementLookup', () => {
  it.each([
    ['loading before the first answer', undefined, null, true, 7, 'loading'],
    ['failed before the first answer', undefined, 'offline', false, 7, 'failed'],
    ['found when the id is on the board', board, null, false, 7, 'found'],
    ['loading while a refetch may still bring it', board, null, true, 8, 'loading'],
    ['missing once the board is settled', board, null, false, 8, 'missing'],
    ['missing for an unreadable id even while fetching', board, null, true, null, 'missing'],
  ] as const)('is %s', (_case, data, errorMessage, isFetching, announcementId, state) => {
    expect(toAnnouncementLookup({ data, errorMessage, isFetching, announcementId }).state).toBe(
      state,
    );
  });
});
