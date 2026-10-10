import { KkFrame, KkFrameGrid, KkPanelSection } from '@furria/ui';
import type { FC } from 'react';
import { useGalleryAlbumPhotosQuery } from '../../api';
import { galleryPhotoLabelOf } from '../../editor-copy';
import { isPickablePhoto } from '../../news-picture';
import type { GalleryPhoto, TieableAlbum } from '../../schemas';

interface NewsGalleryAlbumProps {
  album: TieableAlbum;
  isOpen: boolean;
  onPick: (photo: GalleryPhoto) => void;
}

export const NewsGalleryAlbum: FC<NewsGalleryAlbumProps> = ({ album, isOpen, onPick }) => {
  const photos = useGalleryAlbumPhotosQuery(album.albumId, isOpen);
  const frames = (photos.data?.items ?? []).filter(isPickablePhoto).map((photo, index) => {
    const handleSelect = (): void => {
      onPick(photo);
    };
    return (
      <KkFrame
        key={photo.mediaItemId}
        label={galleryPhotoLabelOf(album.title, index)}
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
