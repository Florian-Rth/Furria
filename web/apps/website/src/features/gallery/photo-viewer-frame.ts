import type { Album, Photo } from '@/features/gallery/gallery-content';
import {
  buildPhotoCountSuffix,
  buildPhotoPlaceholderLabel,
} from '@/features/gallery/gallery-content';
import { canStepPhoto } from '@/features/gallery/photo-viewer-steps';

export interface PhotoViewerFrame {
  photo: Photo;
  placeholderLabel: string;
  position: number;
  countSuffix: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

export const resolvePhotoViewerFrame = (
  album: Album,
  shownIndex: number | null,
): PhotoViewerFrame | null => {
  if (shownIndex === null) {
    return null;
  }

  const photo = album.photos[shownIndex];
  if (photo === undefined) {
    return null;
  }

  const photoCount = album.photos.length;

  return {
    photo,
    placeholderLabel: buildPhotoPlaceholderLabel(album, shownIndex),
    position: shownIndex + 1,
    countSuffix: buildPhotoCountSuffix(photoCount),
    previousDisabled: !canStepPhoto(shownIndex, -1, photoCount),
    nextDisabled: !canStepPhoto(shownIndex, 1, photoCount),
  };
};
