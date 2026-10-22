import { KkFrame } from '@furria/ui/KkFrame';
import { KkFrameGrid } from '@furria/ui/KkFrameGrid';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { FC } from 'react';
import { useGalleryAlbumPhotosQuery } from '../api';
import { isPickablePhoto } from '../gallery-photo';
import { galleryPhotoLabelOf, PHOTOS_LOADING, photosLoadErrorOf } from '../gallery-pick-copy';
import { pickListPhaseOf } from '../pick-list';
import type { GalleryPhoto } from '../schemas';
import type { PickableAlbum } from '../types';
import { PickListStatus } from './PickListStatus';

interface GalleryPickAlbumProps {
  album: PickableAlbum;
  isOpen: boolean;
  onPick: (photo: GalleryPhoto) => void;
}

export const GalleryPickAlbum: FC<GalleryPickAlbumProps> = ({ album, isOpen, onPick }) => {
  const photos = useGalleryAlbumPhotosQuery(album.albumId, isOpen);
  const pickable = photos.data?.items.filter(isPickablePhoto);
  const phase = pickListPhaseOf(pickable?.length, photos.error);
  const errorMessage = photosLoadErrorOf(photos.error);
  const reload = (): void => {
    void photos.refetch();
  };
  const frames = (pickable ?? []).map((photo, index, all) => {
    const handleSelect = (): void => {
      onPick(photo);
    };
    return (
      <KkFrame
        key={photo.mediaItemId}
        label={galleryPhotoLabelOf(album.title, index, all.length)}
        source={photo.urls.small}
        onSelect={handleSelect}
      />
    );
  });

  if (phase === 'empty') {
    return null;
  }

  return (
    <KkPanelSection title={album.title}>
      <KkFrameGrid label={album.title}>{frames}</KkFrameGrid>
      <PickListStatus
        phase={phase}
        loadingLabel={PHOTOS_LOADING}
        errorMessage={errorMessage}
        emptyNote=""
        isRetrying={photos.isFetching}
        onRetry={reload}
      />
    </KkPanelSection>
  );
};
