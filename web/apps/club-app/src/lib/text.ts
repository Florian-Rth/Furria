const COMBINING_MARKS = /\p{M}/gu;
const SHARP_S = /ß/g;
const LATIN_LETTER = /^[A-Z]$/;

export const OTHER_INDEX_LETTER = '#';

export const toIndexLetter = (lastName: string): string => {
  const folded = lastName
    .trim()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(SHARP_S, 'S');
  const [first] = folded;

  if (first === undefined) {
    return OTHER_INDEX_LETTER;
  }

  const letter = first.toUpperCase();

  return LATIN_LETTER.test(letter) ? letter : OTHER_INDEX_LETTER;
};

export const normalizeForSearch = (value: string): string =>
  value.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().replace(SHARP_S, 'ss');
