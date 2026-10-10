import { useNewsMentionablesQuery } from '../api';
import { MENTION_KIND_WORDS } from '../editor-copy';
import { mentionablesOf } from '../mentionables';
import type { NewsMentionable } from '../types';

const NO_MENTIONABLES: readonly NewsMentionable[] = [];

export const useNewsMentionables = (): readonly NewsMentionable[] => {
  const query = useNewsMentionablesQuery();
  return query.data === undefined
    ? NO_MENTIONABLES
    : mentionablesOf(query.data, MENTION_KIND_WORDS.group);
};
