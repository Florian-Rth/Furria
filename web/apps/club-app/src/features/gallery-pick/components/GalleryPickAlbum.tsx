import { KkFrame, KkFrameGrid, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { useGalleryAlbumPhotosQuery } from '../api';
import { isPickablePhoto } from '../gallery-photo';
import { galleryPhotoLabelOf } from '../gallery-pick-copy';
import type { GalleryPhoto } from '../schemas';
import type { PickableAlbum } from '../types';

interface GalleryPickAlbumProps {
  album: PickableAlbum;
  isOpen: boolean;
  onPick: (photo: GalleryPhoto) => void;
}

export const GalleryPickAlbum: FC<GalleryPickAlbumProps> = ({ album, isOpen, onPick }) => {
  const photos = useGalleryAlbumPhotosQuery(album.albumId, isOpen);
  const pickable = (photos.data?.items ?? []).filter(isPickablePhoto);
  const frames = pickable.map((photo, index) => {
    const handleSelect = (): void => {
      onPick(photo);
    };
    return (
      <KkFrame
        key={photo.mediaItemId}
        label={galleryPhotoLabelOf(album.title, index, pickable.length)}
        source={photo.urls.small}
        onSelect={handleSelect}
      />
    );
  });

  if (photos.data !== undefined && frames.length === 0) {
    return null;
  }

  return (
    <KkPanelSection title={album.title}>
      <KkFrameGrid label={album.title}>{frames}</KkFrameGrid>
    </KkPanelSection>
  );
};
