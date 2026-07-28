import { useNavigate, useSearch } from '@tanstack/react-router';
import { buildPhotoParam, resolvePhotoIndex } from '@/features/gallery/photo-viewer-search';
import type { PhotoStepDirection } from '@/features/gallery/photo-viewer-steps';
import { stepPhotoIndex } from '@/features/gallery/photo-viewer-steps';

export interface PhotoViewerState {
  index: number | null;
  open: (index: number) => void;
  step: (direction: PhotoStepDirection) => void;
  close: () => void;
}

export const usePhotoViewer = (photoCount: number): PhotoViewerState => {
  const navigate = useNavigate();
  const { photo } = useSearch({ strict: false });
  const index = resolvePhotoIndex(photo, photoCount);

  const goToPhoto = (nextIndex: number | null, replace: boolean): void => {
    void navigate({
      to: '.',
      search: { photo: nextIndex === null ? undefined : buildPhotoParam(nextIndex) },
      replace,
    });
  };

  return {
    index,
    open: (openedIndex: number): void => goToPhoto(openedIndex, false),
    step: (direction: PhotoStepDirection): void => {
      if (index === null) {
        return;
      }
      goToPhoto(stepPhotoIndex(index, direction, photoCount), true);
    },
    close: (): void => goToPhoto(null, true),
  };
};
