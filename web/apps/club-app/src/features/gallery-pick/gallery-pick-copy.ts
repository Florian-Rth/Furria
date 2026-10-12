export const GALLERY_PICK_CLOSE = 'Schließen';

export const galleryPhotoLabelOf = (albumTitle: string, index: number, count: number): string =>
  `${albumTitle}, Foto ${index + 1} von ${count}`;
