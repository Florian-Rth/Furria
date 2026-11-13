import { toImageSource } from '@furria/ui/image-source';
import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { MentionKind } from '@furria/ui/rich-text';
import { MENTION_KINDS } from '@furria/ui/rich-text';
import { mentionChoiceOf } from '@/features/rich-text/mention-choice';
import { calendarMentionLineOf, newsPostMentionLineOf } from '@/features/rich-text/mention-lines';
import { mentionableOf } from '@/features/rich-text/mentionable';
import { ALBUM_WORD, GROUP_WORD, MEMBER_WORD } from '@/features/rich-text/rich-text-copy';
import type { MentionTargets } from '@/features/rich-text/schemas';
import type { Mentionable } from '@/features/rich-text/types';
import { groupInitialsOf, toInitials } from '@/lib/initials';

const itemOf = (kind: MentionKind, targetId: number, name: string, line: string): Mentionable =>
  mentionableOf({
    kind,
    targetId,
    name,
    line,
    tone: null,
    initials: groupInitialsOf(name),
    image: null,
    isOffered: true,
  });

export const announcementMentionablesOf = (targets: MentionTargets): Mentionable[] => [
  ...targets.groups.map((group) =>
    mentionableOf({
      kind: 'group',
      targetId: group.groupId,
      name: group.name,
      line: group.description.trim().length === 0 ? GROUP_WORD : group.description,
      tone: group.tone,
      initials: groupInitialsOf(group.name),
      image: toImageSource(group.picture, 'groupPicture'),
      isOffered: true,
    }),
  ),
  ...targets.persons.map((person) =>
    mentionableOf({
      kind: 'person',
      targetId: person.personId,
      name: `${person.firstName} ${person.lastName}`,
      line: person.officeName ?? MEMBER_WORD,
      tone: null,
      initials: toInitials(person.firstName, person.lastName),
      image: toImageSource(person.portrait, 'portrait'),
      isOffered: true,
    }),
  ),
  ...targets.calendarEntries.map((entry) =>
    itemOf(
      'calendar-entry',
      entry.calendarEntryId,
      entry.title,
      calendarMentionLineOf(entry.startsAt, false),
    ),
  ),
  ...targets.events.map((event) =>
    itemOf(
      'event',
      event.eventId,
      event.title,
      calendarMentionLineOf(event.startsAt, event.isCancelled),
    ),
  ),
  ...targets.newsPosts.map((post) =>
    itemOf('news-post', post.newsPostId, post.title, newsPostMentionLineOf(post.publishedAt)),
  ),
  ...targets.albums.map((album) => itemOf('album', album.albumId, album.title, ALBUM_WORD)),
];

export const announcementMentionSectionsOf = (
  choices: readonly Mentionable[],
  titles: Readonly<Record<MentionKind, string>>,
): KkMentionSection[] =>
  MENTION_KINDS.map((kind) => ({
    title: titles[kind],
    choices: choices.filter((choice) => choice.kind === kind).map(mentionChoiceOf),
  }));
