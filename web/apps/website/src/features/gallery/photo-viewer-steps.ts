import { photoViewerLabels } from '@/features/gallery/gallery-content';

export type PhotoStepDirection = -1 | 1;

export const clampPhotoIndex = (index: number, photoCount: number): number =>
  Math.min(Math.max(index, 0), photoCount - 1);

export const stepPhotoIndex = (
  index: number,
  direction: PhotoStepDirection,
  photoCount: number,
): number => clampPhotoIndex(index + direction, photoCount);

export const canStepPhoto = (
  index: number,
  direction: PhotoStepDirection,
  photoCount: number,
): boolean => stepPhotoIndex(index, direction, photoCount) !== index;

export const SWIPE_DISTANCE_THRESHOLD = 56;

export const resolveSwipeStep = (offsetX: number): PhotoStepDirection | null => {
  if (offsetX <= -SWIPE_DISTANCE_THRESHOLD) {
    return 1;
  }
  if (offsetX >= SWIPE_DISTANCE_THRESHOLD) {
    return -1;
  }
  return null;
};

export const resolvePhotoStepLabel = (direction: PhotoStepDirection): string =>
  direction === -1 ? photoViewerLabels.previous : photoViewerLabels.next;

export const resolvePhotoStepGlyph = (direction: PhotoStepDirection): string =>
  direction === -1 ? '‹' : '›';

export const resolveArrowStep = (key: string): PhotoStepDirection | null => {
  if (key === 'ArrowLeft') {
    return -1;
  }
  if (key === 'ArrowRight') {
    return 1;
  }
  return null;
};
