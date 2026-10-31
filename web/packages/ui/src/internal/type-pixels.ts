export const REM_PIXELS = 16;

export const typePixelsOf = (
  size: string | number | undefined,
  remPixels: number = REM_PIXELS,
): number => {
  if (typeof size === 'number') {
    return size;
  }
  if (size === undefined) {
    return remPixels;
  }
  const value = Number.parseFloat(size);
  return size.endsWith('rem') ? value * remPixels : value;
};
