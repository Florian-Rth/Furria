import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { Mentionable, MentionablesSource } from '@/features/rich-text/types';
import {
  ANNOUNCEMENT_MENTION_EMPTY,
  ANNOUNCEMENT_MENTION_GONE,
  ANNOUNCEMENT_MENTION_SECTIONS,
  announcementMentionLoadErrorOf,
} from '../announcement-mention-copy';
import {
  announcementMentionablesOf,
  announcementMentionSectionsOf,
} from '../announcement-mentionables';
import { useAnnouncementMentionablesQuery } from '../api';

const NO_MENTIONABLES: readonly Mentionable[] = [];

const sectionsOf = (choices: readonly Mentionable[]): KkMentionSection[] =>
  announcementMentionSectionsOf(choices, ANNOUNCEMENT_MENTION_SECTIONS);

export const useAnnouncementMentionables = (): MentionablesSource => {
  const query = useAnnouncementMentionablesQuery();
  const loadError = query.data === undefined ? announcementMentionLoadErrorOf(query.error) : null;

  return {
    list:
      query.data === undefined
        ? NO_MENTIONABLES
        : announcementMentionablesOf(query.data.mentionables),
    emptyLabel: loadError ?? ANNOUNCEMENT_MENTION_EMPTY,
    sectionsOf,
    missingTargetNote: ANNOUNCEMENT_MENTION_GONE,
  };
};
