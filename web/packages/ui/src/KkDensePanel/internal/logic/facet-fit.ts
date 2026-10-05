import type { FacetPiece } from './facet-pieces';

export type FacetFit = { kind: 'whole' } | { kind: 'cut'; text: string } | { kind: 'drop' };

export interface FacetMeter {
  widthOf: (text: string) => number;
  iconWidth: number;
}

const ELLIPSIS = '…';
const WORD_BREAK = ' ';
const SHORT_WORD_LENGTH = 3;
const TOLERANCE = 1;
const WHOLE: FacetFit = { kind: 'whole' };
const DROP: FacetFit = { kind: 'drop' };

const isShort = (word: string | undefined): boolean =>
  word !== undefined && word.length <= SHORT_WORD_LENGTH;

const withoutShortTail = (words: readonly string[]): string[] => {
  const kept = [...words];

  while (kept.length > 1 && isShort(kept.at(-1))) {
    kept.pop();
  }

  return kept;
};

const cutOf = (text: string, room: number, widthOf: FacetMeter['widthOf']): string | null => {
  const words = text.split(WORD_BREAK);

  for (let count = words.length - 1; count >= 1; count -= 1) {
    const cut = `${withoutShortTail(words.slice(0, count)).join(WORD_BREAK)}${ELLIPSIS}`;

    if (widthOf(cut) <= room) {
      return cut;
    }
  }

  return null;
};

export const fitFacetsOf = (
  pieces: readonly FacetPiece[],
  available: number,
  meter: FacetMeter,
): FacetFit[] => {
  const room = available - TOLERANCE;
  const fits: FacetFit[] = [];
  let used = 0;

  for (const piece of pieces) {
    if (fits.length > 0 && fits.at(-1)?.kind !== 'whole') {
      fits.push(DROP);
      continue;
    }

    const head = meter.widthOf(piece.lead) + (piece.icon === null ? 0 : meter.iconWidth);
    const whole = head + meter.widthOf(piece.text);

    if (used + whole <= room) {
      fits.push(WHOLE);
      used += whole;
      continue;
    }

    const cut = piece.truncates ? cutOf(piece.text, room - used - head, meter.widthOf) : null;

    fits.push(cut === null ? DROP : { kind: 'cut', text: cut });
  }

  return fits;
};
