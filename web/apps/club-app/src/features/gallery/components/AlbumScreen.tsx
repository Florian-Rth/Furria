import { KkScreen } from '@furria/ui/KkScreen';
import { KkScreenHeaderSkeleton } from '@furria/ui/KkScreenHeaderSkeleton';
import type { FC } from 'react';
import { AREA_HANDOVERS, GALLERY_ORIGIN, GALLERY_TITLE } from '@/features/session/app-sections';
import { useAlbum } from '../hooks/use-album';
import { AlbumBody } from './AlbumBody';
import { AlbumFilters } from './AlbumFilters';
import { AlbumHeader } from './AlbumHeader';

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
  const pendingHeader = screen.status === 'loading' ? <KkScreenHeaderSkeleton /> : null;
  const header = screen.album === undefined ? pendingHeader : <AlbumHeader album={screen.album} />;

  return (
    <KkScreen
      kind="list"
      title={title}
      origin={GALLERY_ORIGIN}
      actions={screen.actions}
      tools={tools}
      header={header}
      handover={AREA_HANDOVERS.gallery}
    >
      <AlbumBody albumId={albumId} screen={screen} />
    </KkScreen>
  );
};
