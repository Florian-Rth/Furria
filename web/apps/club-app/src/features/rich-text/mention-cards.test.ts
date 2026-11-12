import type { MentionTarget } from '@furria/ui/rich-text';
import { describe, expect, it } from 'vitest';
import { mentionCardOf, mentionCardsOf, mentionCardsOfTargets } from './mention-cards';

describe('mentionCardOf', () => {
  const cards = mentionCardsOf([
    {
      kind: 'group',
      group: { groupId: 3, name: 'Garde', description: '', tone: null, picture: null },
    },
    {
      kind: 'person',
      person: {
        personId: 5,
        firstName: 'Eva',
        lastName: 'Huber',
        officeName: 'Präsidentin',
        portrait: null,
      },
    },
  ]);

  it.each<[MentionTarget, string | null]>([
    [{ kind: 'group', id: 3 }, 'group'],
    [{ kind: 'person', id: 5 }, 'person'],
    [{ kind: 'group', id: 5 }, null],
    [{ kind: 'person', id: 3 }, null],
    [{ kind: 'event', id: 3 }, null],
    [{ kind: 'album', id: 5 }, null],
  ])('finds the card of mention %j', (target, kind) => {
    expect(mentionCardOf(target, cards)?.kind ?? null).toBe(kind);
  });
});

describe('mentionCardsOfTargets', () => {
  const cards = mentionCardsOfTargets({
    persons: [],
    groups: [],
    calendarEntries: [
      { calendarEntryId: 7, title: 'Training', startsAt: '2026-11-14T18:00:00Z', endsAt: null },
    ],
    events: [
      { eventId: 7, title: 'Prunksitzung', startsAt: '2027-01-30T18:00:00Z', isCancelled: false },
    ],
    newsPosts: [
      {
        newsPostId: 7,
        slug: 'rueckblick',
        title: 'Rückblick',
        publishedAt: '2026-11-10T09:00:00Z',
      },
    ],
    albums: [{ albumId: 9, title: 'Umzug' }],
  });

  it.each<[MentionTarget, string | null]>([
    [{ kind: 'calendar-entry', id: 7 }, 'calendar-entry'],
    [{ kind: 'event', id: 7 }, 'event'],
    [{ kind: 'news-post', id: 7 }, 'news-post'],
    [{ kind: 'album', id: 9 }, 'album'],
    [{ kind: 'album', id: 7 }, null],
    [{ kind: 'person', id: 7 }, null],
  ])('keeps the targets of mention %j apart by kind', (target, kind) => {
    expect(mentionCardOf(target, cards)?.kind ?? null).toBe(kind);
  });
});
