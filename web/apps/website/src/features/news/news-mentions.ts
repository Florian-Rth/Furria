import type { TextMention } from '@furria/ui/rich-text';
import type {
  NewsArticle,
  NewsMentionedGroup,
  NewsMentionedPerson,
} from '@/lib/public-news/schemas';

export interface NewsMentionCards {
  groups: ReadonlyMap<number, NewsMentionedGroup>;
  persons: ReadonlyMap<number, NewsMentionedPerson>;
}

export type NewsMentionCard =
  | { kind: 'group'; group: NewsMentionedGroup }
  | { kind: 'person'; person: NewsMentionedPerson };

export const collectMentionCards = (article: NewsArticle): NewsMentionCards => ({
  groups: new Map(article.mentionedGroups.map((group) => [group.groupId, group])),
  persons: new Map(article.mentionedPersons.map((person) => [person.personId, person])),
});

const groupCardOf = (id: number, cards: NewsMentionCards): NewsMentionCard | null => {
  const group = cards.groups.get(id);
  return group === undefined ? null : { kind: 'group', group };
};

const personCardOf = (id: number, cards: NewsMentionCards): NewsMentionCard | null => {
  const person = cards.persons.get(id);
  return person === undefined ? null : { kind: 'person', person };
};

export const mentionCardOf = (
  mention: TextMention,
  cards: NewsMentionCards,
): NewsMentionCard | null => {
  switch (mention.kind) {
    case 'group':
      return groupCardOf(mention.id, cards);
    case 'person':
      return personCardOf(mention.id, cards);
    default:
      return null;
  }
};

const NAME_WORDS = /[\p{L}\p{N}]+/gu;
const INITIALS_LENGTH = 2;

const initialOf = (word: string): string => word.charAt(0).toLocaleUpperCase('de-DE');

export const groupInitialsOf = (name: string): string =>
  (name.match(NAME_WORDS) ?? []).slice(0, INITIALS_LENGTH).map(initialOf).join('');

export const personInitialsOf = (person: NewsMentionedPerson): string =>
  `${initialOf(person.firstName.trim())}${initialOf(person.lastName.trim())}`;

export const GROUP_PAGE = '/club';

export const groupSearchOf = (groupId: number): { group: number } => ({ group: groupId });

export const personNameOf = (person: NewsMentionedPerson): string =>
  `${person.firstName} ${person.lastName}`;
