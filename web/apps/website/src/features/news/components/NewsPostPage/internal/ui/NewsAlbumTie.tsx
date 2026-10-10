import { KkNewsAlbumCard } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildAlbumHref } from '@/features/gallery';
import { albumStripOf, buildPhotoCountLabel, newsTiesLabels } from '@/features/news/news-content';
import type { NewsAlbum } from '@/lib/public-news/schemas';

interface NewsAlbumTieProps {
  album: NewsAlbum;
}

export const NewsAlbumTie: FC<NewsAlbumTieProps> = ({ album }) => {
  const line = buildPhotoCountLabel(album.photoCount);
  const photos = albumStripOf(album);
  const link = { component: Link, to: buildAlbumHref(album) };

  return (
    <KkNewsAlbumCard
      eyebrow={newsTiesLabels.album}
      title={album.title}
      line={line}
      photos={photos}
      ctaLabel={newsTiesLabels.albumCta}
      link={link}
    />
  );
};
