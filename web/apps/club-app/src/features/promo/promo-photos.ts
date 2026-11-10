const PHOTO_FILES = import.meta.glob<string>(
  './photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);

export const PROMO_PHOTOS: readonly string[] = Object.keys(PHOTO_FILES)
  .toSorted()
  .flatMap((path) => {
    const url = PHOTO_FILES[path];
    return url === undefined ? [] : [url];
  });
