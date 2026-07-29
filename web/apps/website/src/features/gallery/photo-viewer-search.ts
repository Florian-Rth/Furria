export const resolvePhotoIndex = (photo: number | undefined, photoCount: number): number | null => {
  if (photo === undefined) {
    return null;
  }

  const index = photo - 1;
  if (index < 0 || index >= photoCount) {
    return null;
  }

  return index;
};

export const buildPhotoParam = (index: number): number => index + 1;
