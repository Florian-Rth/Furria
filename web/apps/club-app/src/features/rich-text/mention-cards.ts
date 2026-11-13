import type { MentionTarget } from '@furria/ui/rich-text';
import { mentionKeyOf } from '@furria/ui/rich-text';
import type {
  MentionedAlbum,
  MentionedCalendarEntry,
  MentionedEvent,
  MentionedGroup,
  MentionedNewsPost,
  MentionedPerson,
  MentionTargets,
} from './schemas';

export type MentionCard =
  | { kind: 'group'; group: MentionedGroup }
  | { kind: 'person'; person: MentionedPerson }
  | { kind: 'calendar-entry'; entry: MentionedCalendarEntry }
  | { kind: 'event'; event: MentionedEvent }
  | { kind: 'news-post'; post: MentionedNewsPost }
  | { kind: 'album'; album: MentionedAlbum };

export type MentionCards = ReadonlyMap<string, MentionCard>;

const cardTargetOf = (card: MentionCard): MentionTarget => {
  switch (card.kind) {
    case 'group':
      return { kind: 'group', id: card.group.groupId };
    case 'person':
      return { kind: 'person', id: card.person.personId };
    case 'calendar-entry':
      return { kind: 'calendar-entry', id: card.entry.calendarEntryId };
    case 'event':
      return { kind: 'event', id: card.event.eventId };
    case 'news-post':
      return { kind: 'news-post', id: card.post.newsPostId };
    case 'album':
      return { kind: 'album', id: card.album.albumId };
  }
};

export const mentionCardsOf = (cards: readonly MentionCard[]): MentionCards =>
  new Map(cards.map((card) => [mentionKeyOf(cardTargetOf(card)), card]));

export const mentionCardsOfTargets = (targets: MentionTargets): MentionCards =>
  mentionCardsOf([
    ...targets.persons.map((person): MentionCard => ({ kind: 'person', person })),
    ...targets.groups.map((group): MentionCard => ({ kind: 'group', group })),
    ...targets.calendarEntries.map((entry): MentionCard => ({ kind: 'calendar-entry', entry })),
    ...targets.events.map((event): MentionCard => ({ kind: 'event', event })),
    ...targets.newsPosts.map((post): MentionCard => ({ kind: 'news-post', post })),
    ...targets.albums.map((album): MentionCard => ({ kind: 'album', album })),
  ]);

export const mentionCardOf = (target: MentionTarget, cards: MentionCards): MentionCard | null =>
  cards.get(mentionKeyOf(target)) ?? null;
