import { KkPhoto, kkTokens } from '@furria/ui';
import type { FC } from 'react';
import type { Photo } from '@/features/gallery/gallery-content';

interface PhotoTileProps {
  photo: Photo;
  placeholderLabel: string;
}

export const PhotoTile: FC<PhotoTileProps> = ({ photo, placeholderLabel }) => (
  <KkPhoto
    alt={photo.alt}
    orientation={photo.orientation}
    placeholderLabel={placeholderLabel}
    source={photo.source}
    sx={{
      height: '100%',
      border: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
      boxShadow: kkTokens.shadow.rest,
    }}
  />
);
