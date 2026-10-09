import type { KkContactStripFrame } from '@furria/ui';
import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { clockLabel, shownSourceOf } from '../gallery-view';
import { markTrailOf } from '../hub-copy';
import type { HubAlbumMark } from '../hub-view';
import { albumMetaOf, stripMediaOf } from '../hub-view';
import type { GalleryHubAlbum } from '../schemas';

interface GalleryAlbumStripProps {
  album: GalleryHubAlbum;
  mark: HubAlbumMark;
  onOpen: (albumId: number, photo?: number) => void;
}

export const GalleryAlbumStrip: FC<GalleryAlbumStripProps> = ({ album, mark, onOpen }) => {
  const frames: KkContactStripFrame[] = stripMediaOf(album).map((media, position) => ({
    id: String(media.mediaItemId),
    label: `${album.title}, Bild ${position + 1}`,
    source: shownSourceOf(media),
    edge: clockLabel(media.capturedAt),
    onSelect: () => onOpen(album.albumId, media.mediaItemId),
  }));
  const open = (): void => onOpen(album.albumId);
  const tone = mark.kind === 'new' ? 'gold' : 'ink';

  return (
    <KkContactStrip
      title={album.title}
      titleLabel={`${album.title} öffnen`}
      meta={albumMetaOf(album)}
      trail={markTrailOf(mark)}
      tone={tone}
      frames={frames}
      onOpen={open}
    />
  );
};
