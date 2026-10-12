import type { FC } from 'react';
import type { GalleryPhoto } from '@/features/gallery-pick';
import { GalleryPickSheet } from '@/features/gallery-pick';
import { useNewsTieCandidatesQuery } from '../../api';
import {
  GALLERY_COPY_NOTE,
  GALLERY_EMPTY,
  GALLERY_SHEET_ID,
  GALLERY_SHEET_TITLE,
} from '../../editor-copy';

interface NewsGallerySheetProps {
  onPick: (photo: GalleryPhoto) => void;
}

export const NewsGallerySheet: FC<NewsGallerySheetProps> = ({ onPick }) => {
  const candidates = useNewsTieCandidatesQuery(true);

  return (
    <GalleryPickSheet
      id={GALLERY_SHEET_ID}
      title={GALLERY_SHEET_TITLE}
      note={GALLERY_COPY_NOTE}
      emptyNote={GALLERY_EMPTY}
      albums={candidates.data?.albums ?? []}
      onPick={onPick}
    />
  );
};
