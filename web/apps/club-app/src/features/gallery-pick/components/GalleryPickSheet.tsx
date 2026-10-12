import { KkSheet, KkText, useKkSheet } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { GALLERY_PICK_CLOSE } from '../gallery-pick-copy';
import type { GalleryPhoto } from '../schemas';
import type { PickableAlbum } from '../types';
import { GalleryPickAlbum } from './GalleryPickAlbum';

interface GalleryPickSheetProps {
  id: string;
  title: string;
  note: string;
  emptyNote: string;
  albums: readonly PickableAlbum[];
  onPick: (photo: GalleryPhoto) => void;
}

export const GalleryPickSheet: FC<GalleryPickSheetProps> = ({
  id,
  title,
  note,
  emptyNote,
  albums,
  onPick,
}) => {
  const { openSheetId } = useKkSheet();
  const isOpen = openSheetId === id;
  const sections = albums.map((album) => (
    <GalleryPickAlbum key={album.albumId} album={album} isOpen={isOpen} onPick={onPick} />
  ));
  const empty = albums.length === 0 ? <KkText variant="body2">{emptyNote}</KkText> : null;

  return (
    <KkSheet id={id} title={title} closeLabel={GALLERY_PICK_CLOSE}>
      <KkSheet.Body>
        <KkText variant="caption">{note}</KkText>
        <Stack sx={{ gap: 2 }}>
          {sections}
          {empty}
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
