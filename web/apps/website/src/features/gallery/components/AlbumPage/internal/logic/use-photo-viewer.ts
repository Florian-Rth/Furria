import { useNavigate, useSearch } from '@tanstack/react-router';
import { buildPhotoParam, resolvePhotoIndex } from '@/features/gallery/photo-viewer-search';

export interface PhotoViewerState {
  index: number | null;
  open: (index: number) => void;
  show: (index: number) => void;
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
    show: (shownIndex: number): void => goToPhoto(shownIndex, true),
    close: (): void => goToPhoto(null, true),
  };
};
