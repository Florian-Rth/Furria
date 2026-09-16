export interface KkLetterIndexEntry {
  letter: string;
  enabled: boolean;
}

export interface KkLetterIndexCell {
  letter: string;
  disabled: boolean;
  current: boolean;
}

export const toLetterIndexCells = (
  letters: readonly KkLetterIndexEntry[],
  current: string | undefined,
): KkLetterIndexCell[] =>
  letters.map((entry) => ({
    letter: entry.letter,
    disabled: !entry.enabled,
    current: entry.enabled && entry.letter === current,
  }));
