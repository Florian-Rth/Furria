export interface EyebrowCell {
  slot: string;
  from: string;
  to: string;
  turns: boolean;
}

const BLANK = '';

export const eyebrowCellsOf = (from: string | null, to: string): EyebrowCell[] => {
  const next = Array.from(to);
  const previous = from === null ? next : Array.from(from);

  return Array.from({ length: Math.max(previous.length, next.length) }, (_, index) => {
    const before = previous[index] ?? BLANK;
    const after = next[index] ?? BLANK;

    return { slot: String(index), from: before, to: after, turns: before !== after };
  });
};
