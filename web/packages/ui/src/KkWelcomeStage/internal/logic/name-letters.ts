export interface NameLetter {
  key: string;
  glyph: string;
  delayMs: number;
}

export const nameLettersOf = (name: string, atMs: number, staggerMs: number): NameLetter[] =>
  Array.from(name).map((glyph, index) => ({
    key: `${index}-${glyph}`,
    glyph,
    delayMs: atMs + index * staggerMs,
  }));
