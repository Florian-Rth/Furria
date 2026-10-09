import type { FC } from 'react';
import { PhotoGrid } from '@/features/gallery/components/PhotoGrid/PhotoGrid';
import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';

interface AlbumPhotoCellProps {
  entry: AlbumPhotoEntry;
  onOpen: (index: number) => void;
}

export const AlbumPhotoCell: FC<AlbumPhotoCellProps> = ({ entry, onOpen }) => {
  const handleOpen = (): void => onOpen(entry.index);

  return (
    <PhotoGrid.Cell orientation={entry.photo.orientation}>
      <PhotoGrid.Action alt={entry.alt} onOpen={handleOpen}>
        <PhotoGrid.Tile entry={entry} />
      </PhotoGrid.Action>
    </PhotoGrid.Cell>
  );
};
