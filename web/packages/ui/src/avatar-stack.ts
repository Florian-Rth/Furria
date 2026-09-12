export interface KkAvatarStackCircle {
  key: string;
  initials: string;
}

export interface KkAvatarStackPlan {
  circles: readonly KkAvatarStackCircle[];
  overflowLabel: string | null;
}

const MIN_CIRCLES = 1;

const firstGlyph = (entry: string): string => Array.from(entry)[0] ?? '';

const toCircles = (initials: readonly string[]): KkAvatarStackCircle[] =>
  initials.map((entry, index) => ({ key: `${index}-${entry}`, initials: firstGlyph(entry) }));

export const buildAvatarStack = (initials: readonly string[], max: number): KkAvatarStackPlan => {
  const capacity = Math.max(MIN_CIRCLES, Math.trunc(max));

  if (initials.length <= capacity) {
    return { circles: toCircles(initials), overflowLabel: null };
  }

  const shownCount = capacity - 1;

  return {
    circles: toCircles(initials.slice(0, shownCount)),
    overflowLabel: `+${initials.length - shownCount}`,
  };
};
