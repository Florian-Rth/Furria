import type { PickerKey } from './text-commands';
import { matchesMention } from './text-commands';
import type { NewsMentionable } from './types';

const KIND_ORDER = { group: 0, person: 1 } as const;

export const mentionChoicesOf = (
  mentionables: readonly NewsMentionable[],
  query: string,
): NewsMentionable[] =>
  mentionables
    .filter((mentionable) => mentionable.isPublic && matchesMention(mentionable, query))
    .sort((left, right) => KIND_ORDER[left.kind] - KIND_ORDER[right.kind]);

export const steppedIndexOf = (index: number, count: number, key: PickerKey): number => {
  if (count === 0) {
    return 0;
  }
  if (key === 'next') {
    return (index + 1) % count;
  }
  if (key === 'previous') {
    return (index - 1 + count) % count;
  }
  return index;
};
