export interface MeasureBounds {
  min: number;
  max: number;
}

export const parseMeasure = (text: string, bounds: MeasureBounds): number | null => {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }
  const rounded = Math.round(value);

  return rounded < bounds.min || rounded > bounds.max ? null : rounded;
};

export const measureText = (value: number): string => String(Math.round(value));
