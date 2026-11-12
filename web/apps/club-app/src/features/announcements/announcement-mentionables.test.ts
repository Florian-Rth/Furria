import { describe, expect, it } from 'vitest';
import {
  announcementMentionablesOf,
  announcementMentionSectionsOf,
} from './announcement-mentionables';

const TARGETS = {
  persons: [
    { personId: 3, firstName: 'Anna', lastName: 'Becker', officeName: null, portrait: null },
    { personId: 8, firstName: 'Eva', lastName: 'Huber', officeName: 'Präsidentin', portrait: null },
  ],
  groups: [
    { groupId: 12, name: 'Rote Funken', description: '', tone: 'rose' as const, picture: null },
    { groupId: 13, name: 'Garde', description: 'Tanzt', tone: null, picture: null },
  ],
  calendarEntries: [
    { calendarEntryId: 4, title: 'Training', startsAt: '2026-11-14T18:00:00Z', endsAt: null },
  ],
  events: [
    { eventId: 5, title: 'Prunksitzung', startsAt: '2027-01-30T18:00:00Z', isCancelled: true },
  ],
  newsPosts: [
    { newsPostId: 6, slug: 'rueckblick', title: 'Rückblick', publishedAt: '2026-11-10T09:00:00Z' },
  ],
  albums: [{ albumId: 7, title: 'Umzug' }],
};

const TITLES = {
  group: 'groups',
  person: 'persons',
  'calendar-entry': 'entries',
  event: 'events',
  'news-post': 'news',
  album: 'albums',
};

describe('announcementMentionablesOf', () => {
  it.each([
    ['group:13', 'Tanzt'],
    ['person:8', 'Präsidentin'],
  ])('lines %s with what the target says about itself', (id, line) => {
    const mentionable = announcementMentionablesOf(TARGETS).find((entry) => entry.id === id);

    expect(mentionable?.line).toBe(line);
  });
});

describe('announcementMentionSectionsOf', () => {
  it('files every kind into its own section in mention order', () => {
    const sections = announcementMentionSectionsOf(announcementMentionablesOf(TARGETS), TITLES);

    expect(
      sections.map((section) => [section.title, section.choices.map((choice) => choice.id)]),
    ).toEqual([
      ['groups', ['group:12', 'group:13']],
      ['persons', ['person:3', 'person:8']],
      ['entries', ['calendar-entry:4']],
      ['events', ['event:5']],
      ['news', ['news-post:6']],
      ['albums', ['album:7']],
    ]);
  });
});
