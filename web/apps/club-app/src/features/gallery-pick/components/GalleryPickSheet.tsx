import { KkSheet } from '@furria/ui/KkSheet';
import { KkText } from '@furria/ui/KkText';
import { useKkSheet } from '@furria/ui/sheet-store';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { ALBUMS_LOADING, albumsLoadErrorOf, GALLERY_PICK_CLOSE } from '../gallery-pick-copy';
import { pickListPhaseOf } from '../pick-list';
import type { GalleryPhoto } from '../schemas';
import type { PickableAlbum } from '../types';
import { GalleryPickAlbum } from './GalleryPickAlbum';
import { PickListStatus } from './PickListStatus';

interface GalleryPickSheetProps {
  id: string;
  title: string;
  note: string;
  emptyNote: string;
  albums: readonly PickableAlbum[] | undefined;
  albumsError: Error | null;
  isReloading: boolean;
  onReload: () => void;
  onPick: (photo: GalleryPhoto) => void;
}

export const GalleryPickSheet: FC<GalleryPickSheetProps> = ({
  id,
  title,
  note,
  emptyNote,
  albums,
  albumsError,
  isReloading,
  onReload,
  onPick,
}) => {
  const { openSheetId } = useKkSheet();
  const isOpen = openSheetId === id;
  const sections = (albums ?? []).map((album) => (
    <GalleryPickAlbum key={album.albumId} album={album} isOpen={isOpen} onPick={onPick} />
  ));
  const phase = pickListPhaseOf(albums?.length, albumsError);
  const errorMessage = albumsLoadErrorOf(albumsError);

  return (
    <KkSheet id={id} title={title} closeLabel={GALLERY_PICK_CLOSE}>
      <KkSheet.Body>
        <KkText variant="caption">{note}</KkText>
        <Stack sx={{ gap: 2 }}>
          {sections}
          <PickListStatus
            phase={phase}
            loadingLabel={ALBUMS_LOADING}
            errorMessage={errorMessage}
            emptyNote={emptyNote}
            isRetrying={isReloading}
            onRetry={onReload}
          />
        </Stack>
      </KkSheet.Body>
    </KkSheet>
  );
};
