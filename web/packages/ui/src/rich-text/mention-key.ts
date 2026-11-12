import type { MentionKind, TextMention } from './rich-text-model';
import { MENTION_KINDS } from './rich-text-model';
import { isMentionId } from './rich-text-syntax';

export type MentionTarget = Pick<TextMention, 'kind' | 'id'>;

export const MENTION_KEY_ATTRIBUTE = 'data-kk-mention-id';

const MENTION_KEY = /^([a-z-]+):([0-9]+)$/;

export const isMentionKind = (value: string): value is MentionKind =>
  MENTION_KINDS.some((kind) => kind === value);

export const mentionKeyOf = (target: MentionTarget): string => `${target.kind}:${target.id}`;

export const mentionTargetOf = (
  key: string,
  kinds: readonly MentionKind[],
): MentionTarget | null => {
  const match = MENTION_KEY.exec(key);
  const kind = match?.[1] ?? '';
  const id = Number(match?.[2]);
  return isMentionKind(kind) && kinds.includes(kind) && isMentionId(id) ? { kind, id } : null;
};
