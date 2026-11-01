import { KkNewsAlbumCard } from '@furria/ui/KkNewsAlbumCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { albumStripOf, photoCountOf } from '../read-news';
import { TIE_LABELS } from '../read-news-copy';
import type { ReadNewsAlbum } from '../schemas';

interface ReadNewsAlbumTieProps {
  album: ReadNewsAlbum;
}

export const ReadNewsAlbumTie: FC<ReadNewsAlbumTieProps> = ({ album }) => {
  const line = photoCountOf(album.photoCount);
  const photos = albumStripOf(album);
  const link = { component: Link, to: `/gallery/${album.albumId}` };

  return (
    <KkNewsAlbumCard
      eyebrow={TIE_LABELS.album}
      title={album.title}
      line={line}
      photos={photos}
      ctaLabel={TIE_LABELS.albumCta}
      link={link}
    />
  );
};
