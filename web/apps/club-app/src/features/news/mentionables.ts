import type { KkProseMentionTone } from '@furria/ui';
import type { NewsInline } from '@furria/ui/news-text';
import { readNewsText } from '@furria/ui/news-text';
import { newsMentionKeyOf } from '@/lib/news-prose';
import type { NewsMentionables } from './schemas';
import type { NewsMentionable } from './types';

const initialsOf = (words: readonly string[]): string =>
  words
    .map((word) => word.trim().charAt(0))
    .filter((letter) => letter.length > 0)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const mentionablesOf = (
  response: NewsMentionables,
  groupWord: string,
): NewsMentionable[] => [
  ...response.groups.map(
    (group): NewsMentionable => ({
      kind: 'group',
      id: newsMentionKeyOf('group', group.groupId),
      targetId: group.groupId,
      name: group.name,
      line: group.description.trim().length === 0 ? groupWord : group.description,
      tone: group.tone,
      initials: initialsOf(group.name.split(/\s+/)),
      pictureSource: group.picture?.smallUrl ?? null,
      isPublic: true,
    }),
  ),
  ...response.persons.map(
    (person): NewsMentionable => ({
      kind: 'person',
      id: newsMentionKeyOf('person', person.personId),
      targetId: person.personId,
      name: `${person.firstName} ${person.lastName}`,
      line: person.officeName,
      tone: null,
      initials: initialsOf([person.firstName, person.lastName]),
      pictureSource: person.portrait?.smallUrl ?? null,
      isPublic: true,
    }),
  ),
];

const mentionKeysIn = (inlines: readonly NewsInline[]): string[] =>
  inlines.flatMap((inline) =>
    inline.kind === 'mention' ? [newsMentionKeyOf(inline.mention.kind, inline.mention.id)] : [],
  );

export const mentionKeysOf = (text: string): string[] =>
  readNewsText(text).flatMap((block) =>
    block.kind === 'list' ? block.items.flatMap(mentionKeysIn) : mentionKeysIn(block.inlines),
  );

export const mentionTonesOf = (
  mentionables: readonly NewsMentionable[],
  text: string,
): KkProseMentionTone[] => {
  const known = new Set(mentionables.map((mentionable) => mentionable.id));
  const stale = [...new Set(mentionKeysOf(text))].filter((key) => !known.has(key));
  return [
    ...mentionables.map((mentionable) => ({
      id: mentionable.id,
      tone: mentionable.tone,
      isPublic: true,
    })),
    ...stale.map((id) => ({ id, tone: null, isPublic: false })),
  ];
};
