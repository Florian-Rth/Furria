import { KkSheet, KkText, useKkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useNewsTieCandidatesQuery } from '../../api';
import {
  GALLERY_COPY_NOTE,
  GALLERY_EMPTY,
  GALLERY_SHEET_ID,
  GALLERY_SHEET_TITLE,
  SHEET_CLOSE,
} from '../../editor-copy';
import type { GalleryPhoto } from '../../schemas';
import { NewsGalleryAlbum } from './NewsGalleryAlbum';

interface NewsGallerySheetProps {
  onPick: (photo: GalleryPhoto) => void;
}

export const NewsGallerySheet: FC<NewsGallerySheetProps> = ({ onPick }) => {
  const { openSheetId } = useKkSheet();
  const isOpen = openSheetId === GALLERY_SHEET_ID;
  const candidates = useNewsTieCandidatesQuery(true);
  const albums = candidates.data?.albums ?? [];
  const sections = albums.map((album) => (
    <NewsGalleryAlbum key={album.albumId} album={album} isOpen={isOpen} onPick={onPick} />
  ));
  const empty = albums.length === 0 ? <KkText variant="body2">{GALLERY_EMPTY}</KkText> : null;

  return (
    <KkSheet id={GALLERY_SHEET_ID} title={GALLERY_SHEET_TITLE} closeLabel={SHEET_CLOSE}>
      <KkSheet.Body>
        <KkText variant="caption">{GALLERY_COPY_NOTE}</KkText>
        <Stack sx={{ gap: 2 }}>
          {sections}
          {empty}
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
