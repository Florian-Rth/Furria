export interface NumberBounds {
  min?: number;
  max?: number;
}

const WHOLE_NUMBER = /^-?\d+$/;

const clampTo = (value: number, bounds: NumberBounds): number =>
  Math.min(
    Math.max(value, bounds.min ?? Number.NEGATIVE_INFINITY),
    bounds.max ?? Number.POSITIVE_INFINITY,
  );

export const stepNumber = (value: string, delta: number, bounds: NumberBounds): string => {
  const trimmed = value.trim();

  if (!WHOLE_NUMBER.test(trimmed)) {
    const start = delta > 0 ? bounds.min : bounds.max;

    return String(start ?? 0);
  }

  return String(clampTo(Number(trimmed) + delta, bounds));
};

export const canStep = (value: string, delta: number, bounds: NumberBounds): boolean => {
  const trimmed = value.trim();

  if (!WHOLE_NUMBER.test(trimmed)) {
    return true;
  }

  const limit = delta > 0 ? bounds.max : bounds.min;

  return limit === undefined || (delta > 0 ? Number(trimmed) < limit : Number(trimmed) > limit);
};
