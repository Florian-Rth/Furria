import { KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { ReviewAlbumFacts } from '../event-review-copy';
import { toAlbumRowCopy } from '../event-review-copy';

interface ReviewAlbum extends ReviewAlbumFacts {
  albumId: number;
  title: string;
}

interface EventReviewAlbumRowProps {
  album: ReviewAlbum;
}

export const EventReviewAlbumRow: FC<EventReviewAlbumRowProps> = ({ album }) => {
  const params = { albumId: String(album.albumId) };
  const copy = toAlbumRowCopy(album);
  const tone = album.publishedAt === null ? 'neutral' : 'accent';

  return (
    <KkFactRow
      title={album.title}
      span={copy.span}
      spanLabel={copy.spanLabel}
      meta={copy.meta}
      tone={tone}
      component={Link}
      to="/gallery/$albumId"
      params={params}
    />
  );
};
