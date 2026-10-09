import { KkPhoto, kkTokens } from '@furria/ui';
import type { FC } from 'react';
import type { AlbumPhotoEntry } from '@/features/gallery/gallery-content';
import { photoTileSizes } from '@/features/gallery/gallery-content';

interface PhotoTileProps {
  entry: AlbumPhotoEntry;
}

export const PhotoTile: FC<PhotoTileProps> = ({ entry }) => {
  const placeholderLabel = String(entry.photo.mediaItemId);

  return (
    <KkPhoto
      alt={entry.alt}
      orientation={entry.photo.orientation}
      placeholderLabel={placeholderLabel}
      source={entry.photo.mediumUrl}
      sourceSet={entry.sourceSet}
      sizes={photoTileSizes}
      sx={{
        height: '100%',
        border: `${kkTokens.line.hair}px solid`,
        borderColor: 'divider',
        boxShadow: kkTokens.shadow.rest,
      }}
    />
  );
};
