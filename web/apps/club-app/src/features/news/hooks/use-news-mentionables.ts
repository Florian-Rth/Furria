import type { KkMentionSection } from '@furria/ui/KkMentionPicker';
import type { Mentionable, MentionablesSource } from '@/features/rich-text/types';
import { useNewsMentionablesQuery } from '../api';
import {
  MENTION_BOARD,
  MENTION_EMPTY,
  MENTION_GROUP_WORD,
  MENTION_GROUPS,
  MENTION_NOT_PUBLIC,
  mentionLoadErrorOf,
} from '../editor-copy';
import { mentionablesOf, newsMentionSectionsOf } from '../mentionables';

const NO_MENTIONABLES: readonly Mentionable[] = [];

const SECTION_TITLES = { groups: MENTION_GROUPS, board: MENTION_BOARD };

const sectionsOf = (choices: readonly Mentionable[]): KkMentionSection[] =>
  newsMentionSectionsOf(choices, SECTION_TITLES);

export const useNewsMentionables = (): MentionablesSource => {
  const query = useNewsMentionablesQuery();
  const loadError = query.data === undefined ? mentionLoadErrorOf(query.error) : null;

  return {
    list:
      query.data === undefined ? NO_MENTIONABLES : mentionablesOf(query.data, MENTION_GROUP_WORD),
    emptyLabel: loadError ?? MENTION_EMPTY,
    sectionsOf,
    missingTargetNote: MENTION_NOT_PUBLIC,
  };
};
