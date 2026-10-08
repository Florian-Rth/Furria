import type { KkContactStripFrame } from '@furria/ui';
import { KkContactStrip } from '@furria/ui';
import type { FC } from 'react';
import { PUBLISHED_MARK, SELECTION_TITLE } from '../gallery-copy';
import type { HubAlbum } from '../gallery-view';
import { albumMetaLine, clockLabel } from '../gallery-view';
import { labSourceOf } from '../lab-gallery-data';

interface GalleryAlbumStripProps {
  entry: HubAlbum;
  showsSelection: boolean;
  onOpen: (albumId: string, photo?: number) => void;
}

const selectionTrailOf = (entry: HubAlbum, showsSelection: boolean): string | undefined => {
  if (!entry.album.published) {
    return showsSelection && entry.album.selection > 0
      ? `${SELECTION_TITLE} ${entry.album.selection}`
      : undefined;
  }
  return PUBLISHED_MARK;
};

export const GalleryAlbumStrip: FC<GalleryAlbumStripProps> = ({
  entry,
  showsSelection,
  onOpen,
}) => {
  const shown = entry.cover === undefined ? entry.samples : [entry.cover, ...entry.samples];
  const frames: KkContactStripFrame[] = shown.map((item) => ({
    id: String(item.id),
    label: `${entry.album.title}, Bild ${item.number}`,
    source: labSourceOf(item.photo),
    edge: clockLabel(item.capturedAt) || `#${item.number}`,
    onSelect: () => onOpen(entry.album.id, item.number),
  }));
  const open = (): void => onOpen(entry.album.id);

  return (
    <KkContactStrip
      title={entry.album.title}
      titleLabel={`${entry.album.title} öffnen`}
      meta={albumMetaLine(entry.album, entry.counts)}
      trail={selectionTrailOf(entry, showsSelection)}
      frames={frames}
      onOpen={open}
    />
  );
};
