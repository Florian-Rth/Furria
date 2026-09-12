export interface KkAvatarStackCircle {
  key: string;
  initials: string;
}

export interface KkAvatarStackPlan {
  circles: readonly KkAvatarStackCircle[];
  overflowLabel: string | null;
}

const MIN_CIRCLES = 1;
const NO_OVERFLOW = 0;

const firstGlyph = (entry: string): string => Array.from(entry)[0] ?? '';

const toCircles = (initials: readonly string[]): KkAvatarStackCircle[] =>
  initials.map((entry, index) => ({ key: `${index}-${entry}`, initials: firstGlyph(entry) }));

const toOverflowLabel = (hidden: number): string | null =>
  hidden <= NO_OVERFLOW ? null : `+${hidden}`;

export const buildAvatarStack = (
  initials: readonly string[],
  max: number,
  total?: number,
): KkAvatarStackPlan => {
  const capacity = Math.max(MIN_CIRCLES, Math.trunc(max));

  if (total !== undefined) {
    const shown = initials.slice(0, capacity);

    return { circles: toCircles(shown), overflowLabel: toOverflowLabel(total - shown.length) };
  }

  if (initials.length <= capacity) {
    return { circles: toCircles(initials), overflowLabel: null };
  }

  const shownCount = capacity - 1;

  return {
    circles: toCircles(initials.slice(0, shownCount)),
    overflowLabel: toOverflowLabel(initials.length - shownCount),
  };
};
