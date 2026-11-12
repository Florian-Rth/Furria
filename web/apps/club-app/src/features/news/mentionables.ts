import { toImageSource } from '@furria/ui/image-source';
import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { KkProseMentionTone } from '@furria/ui/KkProseField';
import { NEWS_MENTION_KINDS } from '@furria/ui/news-mention-kinds';
import type { RichTextInline } from '@furria/ui/rich-text';
import { mentionKeyOf, readRichText } from '@furria/ui/rich-text';
import { mentionChoiceOf } from '@/features/rich-text/mention-choice';
import { mentionableOf } from '@/features/rich-text/mentionable';
import type { Mentionable } from '@/features/rich-text/types';
import { groupInitialsOf, toInitials } from '@/lib/initials';
import type { NewsMentionables } from './schemas';

export const mentionablesOf = (response: NewsMentionables, groupWord: string): Mentionable[] => [
  ...response.groups.map((group) =>
    mentionableOf({
      kind: 'group',
      targetId: group.groupId,
      name: group.name,
      line: group.description.trim().length === 0 ? groupWord : group.description,
      tone: group.tone,
      initials: groupInitialsOf(group.name),
      image: toImageSource(group.picture, 'groupPicture'),
      isOffered: true,
    }),
  ),
  ...response.persons.map((person) =>
    mentionableOf({
      kind: 'person',
      targetId: person.personId,
      name: `${person.firstName} ${person.lastName}`,
      line: person.officeName,
      tone: null,
      initials: toInitials(person.firstName, person.lastName),
      image: toImageSource(person.portrait, 'portrait'),
      isOffered: true,
    }),
  ),
];

const mentionKeysIn = (inlines: readonly RichTextInline[]): string[] =>
  inlines.flatMap((inline) => (inline.kind === 'mention' ? [mentionKeyOf(inline.mention)] : []));

export const mentionKeysOf = (text: string): string[] =>
  readRichText(text, NEWS_MENTION_KINDS).flatMap((block) =>
    block.kind === 'list' ? block.items.flatMap(mentionKeysIn) : mentionKeysIn(block.inlines),
  );

export const mentionTonesOf = (
  mentionables: readonly Mentionable[],
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

export const newsMentionSectionsOf = (
  choices: readonly Mentionable[],
  titles: { groups: string; board: string },
): KkMentionSection[] => [
  {
    title: titles.groups,
    choices: choices.filter((choice) => choice.kind === 'group').map(mentionChoiceOf),
  },
  {
    title: titles.board,
    choices: choices.filter((choice) => choice.kind === 'person').map(mentionChoiceOf),
  },
];
