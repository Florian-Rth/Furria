export const KK_ASPECT = {
  portrait: 4 / 5,
  groupPicture: 3 / 2,
  banner: 2,
  landscape: 7 / 5,
} as const;

export type KkAspect = keyof typeof KK_ASPECT | number;

export interface KkSize {
  width: number;
  height: number;
}

const LARGEST_RATIO_TERM = 32;
const FRACTION_TOLERANCE = 1e-6;

export const aspectOf = (aspect: KkAspect): number =>
  typeof aspect === 'number' ? aspect : KK_ASPECT[aspect];

const smallestDenominatorOf = (ratio: number): number | undefined =>
  Array.from({ length: LARGEST_RATIO_TERM }, (_, index) => index + 1).find(
    (denominator) =>
      Math.abs(ratio * denominator - Math.round(ratio * denominator)) < FRACTION_TOLERANCE,
  );

export const aspectRatioCss = (aspect: KkAspect): string => {
  const ratio = aspectOf(aspect);
  const denominator = smallestDenominatorOf(ratio);

  return denominator === undefined
    ? String(ratio)
    : `${Math.round(ratio * denominator)} / ${denominator}`;
};
