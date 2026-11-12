import { plainTextOf } from './plain-text';
import type { MentionKind } from './rich-text-model';

const WORDS_PER_MINUTE = 180;

const READING_TIME_MINIMUM_MINUTES = 3;

export const readingMinutesOf = (text: string, kinds: readonly MentionKind[]): number | null => {
  const wordCount = plainTextOf(text, kinds)
    .split(/\s+/)
    .filter((word) => word !== '').length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

  return minutes < READING_TIME_MINIMUM_MINUTES ? null : minutes;
};
