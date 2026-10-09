import { KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_ORIGIN, GALLERY_TITLE } from '@/features/session';
import { useAlbum } from '../hooks/use-album';
import { AlbumBody } from './AlbumBody';
import { AlbumFilters } from './AlbumFilters';

interface AlbumScreenProps {
  albumId: number;
}

export const AlbumScreen: FC<AlbumScreenProps> = ({ albumId }) => {
  const screen = useAlbum(albumId);
  const title = screen.album?.title ?? GALLERY_TITLE;
  const tools =
    screen.album === undefined ? undefined : (
      <AlbumFilters
        kind={screen.kind}
        kindOptions={screen.kindOptions}
        uploader={screen.uploader}
        uploaderOptions={screen.uploaderOptions}
        onKind={screen.setKind}
        onUploader={screen.setUploader}
      />
    );

  return (
    <KkScreen
      kind="list"
      title={title}
      origin={GALLERY_ORIGIN}
      actions={screen.actions}
      tools={tools}
      handover={AREA_HANDOVERS.gallery}
    >
      <AlbumBody albumId={albumId} screen={screen} />
    </KkScreen>
  );
};
