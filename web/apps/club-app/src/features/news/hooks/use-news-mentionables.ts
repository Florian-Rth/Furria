import { useNewsMentionablesQuery } from '../api';
import { MENTION_EMPTY, MENTION_KIND_WORDS, mentionLoadErrorOf } from '../editor-copy';
import { mentionablesOf } from '../mentionables';
import type { NewsMentionable } from '../types';

export interface NewsMentionables {
  list: readonly NewsMentionable[];
  emptyLabel: string;
}

const NO_MENTIONABLES: readonly NewsMentionable[] = [];

export const useNewsMentionables = (): NewsMentionables => {
  const query = useNewsMentionablesQuery();
  const loadError = query.data === undefined ? mentionLoadErrorOf(query.error) : null;

  return {
    list:
      query.data === undefined
        ? NO_MENTIONABLES
        : mentionablesOf(query.data, MENTION_KIND_WORDS.group),
    emptyLabel: loadError ?? MENTION_EMPTY,
  };
};
