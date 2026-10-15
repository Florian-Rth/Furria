const REM_PIXELS = 16;

export const typePixelsOf = (size: string | number | undefined): number => {
  if (typeof size === 'number') {
    return size;
  }
  if (size === undefined) {
    return REM_PIXELS;
  }
  const value = Number.parseFloat(size);
  return size.endsWith('rem') ? value * REM_PIXELS : value;
};
