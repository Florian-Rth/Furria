import type { KkPressRulerAxisKind, KkPressRulerAxisLabel } from '../../press-ruler-data';

const CHARACTER_WIDTH = 7.4;
const LABEL_GAP = 8;

const LEFT_OF: Record<KkPressRulerAxisKind, (x: number, width: number) => number> = {
  opening: (x) => x,
  month: (x, width) => x - width / 2,
  fest: (x, width) => x - width / 2,
  summer: (x, width) => x - width,
};

export interface PlacedAxisLabel extends KkPressRulerAxisLabel {
  x: number;
}

const spanOf = (label: KkPressRulerAxisLabel, x: number): [number, number] => {
  const width = label.text.length * CHARACTER_WIDTH;
  const left = LEFT_OF[label.kind](x, width);

  return [left, left + width];
};

export const placedAxisLabelsOf = (
  labels: readonly KkPressRulerAxisLabel[],
  width: number,
): PlacedAxisLabel[] => {
  const taken: [number, number][] = [];
  const placed: PlacedAxisLabel[] = [];

  for (const label of labels) {
    const x = label.share * width;
    const [left, right] = spanOf(label, x);
    const fits = left >= 0 && right <= width;
    const collides = taken.some(
      ([takenLeft, takenRight]) => left < takenRight + LABEL_GAP && right > takenLeft - LABEL_GAP,
    );

    if (fits && !collides) {
      taken.push([left, right]);
      placed.push({ ...label, x });
    }
  }

  return placed.sort((left, right) => left.x - right.x);
};
