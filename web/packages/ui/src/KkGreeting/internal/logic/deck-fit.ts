import { pseudoRandom } from '../../../confetti-pieces';

export type FlapFaceWidth = (face: string) => number;

const LETTERS: readonly string[] = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
const DAYS_PER_MONTH = 31;
const MONTHS_PER_YEAR = 12;
const CELL_SPREAD = 3;
const LOCALE = 'de-DE';

export const deckForCell = (
  cellWidth: number,
  faces: readonly string[],
  widthOf: FlapFaceWidth,
): string[] => {
  const fitting = faces
    .map((face) => face.toLocaleUpperCase(LOCALE))
    .filter((face) => widthOf(face) <= cellWidth);

  return fitting.length > 0 ? fitting : [...LETTERS];
};

export const daySeedOf = (day: Date): number =>
  (day.getFullYear() * MONTHS_PER_YEAR + day.getMonth()) * DAYS_PER_MONTH + day.getDate();

export const seededOrderOf = (faces: readonly string[], seed: number): string[] =>
  faces
    .map((face, index) => ({ face, rank: pseudoRandom(seed, index) }))
    .sort((left, right) => left.rank - right.rank)
    .map((entry) => entry.face);

export const deckFacesOf = (
  deck: readonly string[],
  seed: number,
  cell: number,
  count: number,
): string[] => {
  const order = seededOrderOf(deck, seed);
  const start = cell * CELL_SPREAD;

  return order.length === 0
    ? []
    : Array.from({ length: count }, (_, step) => order[(start + step) % order.length] ?? '');
};

export const orderedFacesOf = (deck: readonly string[], count: number): string[] =>
  deck.length === 0
    ? []
    : Array.from({ length: count }, (_, index) => deck[index % deck.length] ?? '');
