import type { NewsMention } from './news-text-model';
import { isMentionId } from './news-text-syntax';

export type NewsMentionTarget = Pick<NewsMention, 'kind' | 'id'>;

export const NEWS_MENTION_KEY_ATTRIBUTE = 'data-kk-mention-id';

const MENTION_KEY = /^(group|person):([0-9]+)$/;

export const newsMentionKeyOf = (target: NewsMentionTarget): string =>
  `${target.kind}:${target.id}`;

export const newsMentionTargetOf = (key: string): NewsMentionTarget | null => {
  const match = MENTION_KEY.exec(key);
  if (match === null) {
    return null;
  }
  const id = Number(match[2]);
  return isMentionId(id) ? { kind: match[1] === 'person' ? 'person' : 'group', id } : null;
};
