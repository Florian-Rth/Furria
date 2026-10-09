import type { FC } from 'react';
import { FeaturedAlbum } from '@/features/gallery/components/FeaturedAlbum/FeaturedAlbum';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface FeaturedAlbumBannerProps {
  album: AlbumSummary | undefined;
}

export const FeaturedAlbumBanner: FC<FeaturedAlbumBannerProps> = ({ album }) => {
  if (album === undefined) {
    return null;
  }

  return (
    <FeaturedAlbum album={album}>
      <FeaturedAlbum.Cover album={album} />
      <FeaturedAlbum.Overlay>
        <FeaturedAlbum.Caption>
          <FeaturedAlbum.Flag />
          <FeaturedAlbum.Title album={album} />
          <FeaturedAlbum.Meta album={album} />
        </FeaturedAlbum.Caption>
        <FeaturedAlbum.Action />
      </FeaturedAlbum.Overlay>
    </FeaturedAlbum>
  );
};
