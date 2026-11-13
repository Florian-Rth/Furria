import { describe, expect, it } from 'vitest';
import type { Announcement } from '@/features/announcements/schemas';
import { toAnnouncementPanelItems } from './announcement-panel-items';
import type { ClubAnnouncement } from './schemas';

const NO_MENTIONS = {
  persons: [],
  groups: [],
  calendarEntries: [],
  events: [],
  newsPosts: [],
  albums: [],
};

const hubAnnouncement = (announcementId: number): ClubAnnouncement => ({
  announcementId,
  title: 'Sommerfest',
  body: 'Wer kommt?',
  mentions: NO_MENTIONS,
  publishedAt: '2027-01-18T09:00:00Z',
  validUntil: null,
  author: null,
});

const detail: Announcement = {
  announcementId: 5,
  title: 'Sommerfest',
  body: 'Wer kommt?',
  mentions: NO_MENTIONS,
  publishedAt: '2027-01-18T09:00:00Z',
  validUntil: null,
  author: null,
  viewerMayEdit: false,
  addOns: [
    {
      kind: 'attendance',
      attendance: {
        answersUntil: null,
        closedAt: null,
        closedByFirstName: null,
        closedByLastName: null,
        isClosed: false,
        yes: 0,
        maybe: 0,
        no: 0,
        concernedCount: 12,
        answers: [],
        notAnswered: null,
        reminder: null,
      },
      borrowed: null,
    },
  ],
  answerCount: 0,
  viewerAnswer: null,
  viewerMayAnswer: true,
};

describe('toAnnouncementPanelItems', () => {
  it('shows the newest two Aushänge in full, shortens the third and marks the add-ons it has details for', () => {
    const items = toAnnouncementPanelItems(
      [hubAnnouncement(5), hubAnnouncement(6), hubAnnouncement(7)],
      [detail],
      '2027-01-19T08:00:00Z',
    );

    expect(
      items.map((item) => ({
        size: item.size,
        isNew: item.isNew,
        states: item.marks.map((mark) => mark.state),
      })),
    ).toEqual([
      { size: 'regular', isNew: false, states: ['owed'] },
      { size: 'regular', isNew: false, states: [] },
      { size: 'compact', isNew: false, states: [] },
    ]);
  });
});
