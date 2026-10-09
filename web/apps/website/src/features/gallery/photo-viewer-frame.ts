import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';
import { buildPhotoCountSuffix } from '@/features/gallery/gallery-content';
import { canStepPhoto } from '@/features/gallery/photo-viewer-steps';

export interface PhotoViewerFrame {
  entry: AlbumPhotoEntry;
  position: number;
  countSuffix: string;
  previousDisabled: boolean;
  nextDisabled: boolean;
}

export const resolvePhotoViewerFrame = (
  entries: AlbumPhotoEntry[],
  shownIndex: number | null,
): PhotoViewerFrame | null => {
  if (shownIndex === null) {
    return null;
  }

  const entry = entries[shownIndex];
  if (entry === undefined) {
    return null;
  }

  const photoCount = entries.length;

  return {
    entry,
    position: shownIndex + 1,
    countSuffix: buildPhotoCountSuffix(photoCount),
    previousDisabled: !canStepPhoto(shownIndex, -1, photoCount),
    nextDisabled: !canStepPhoto(shownIndex, 1, photoCount),
  };
};
