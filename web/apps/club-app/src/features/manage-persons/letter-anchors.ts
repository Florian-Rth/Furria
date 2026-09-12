import type { LetterAnchor } from '@/lib/use-letter-position';

const LETTER_ANCHOR_PREFIX = 'person-letter-';
const OTHER_LETTER_ANCHOR = `${LETTER_ANCHOR_PREFIX}other`;
const LATIN_LETTER = /^[A-Z]$/;

export const toLetterAnchorId = (letter: string): string =>
  LATIN_LETTER.test(letter)
    ? `${LETTER_ANCHOR_PREFIX}${letter.toLowerCase()}`
    : OTHER_LETTER_ANCHOR;

export const toLetterAnchors = (sections: readonly { letter: string }[]): LetterAnchor[] =>
  sections.map((section) => ({
    letter: section.letter,
    anchorId: toLetterAnchorId(section.letter),
  }));
