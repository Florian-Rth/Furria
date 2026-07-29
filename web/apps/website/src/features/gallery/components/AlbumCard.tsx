import { KkCard, KkPhoto, kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import {
  albumCoverOrientation,
  albumLinkLabel,
  buildAlbumCoverAlt,
  buildAlbumCoverSource,
  buildAlbumHref,
  buildAlbumMeta,
  buildPhotoCountLabel,
} from '@/features/gallery/gallery-content';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: FC<AlbumCardProps> = ({ album }) => {
  const albumHref = buildAlbumHref(album.slug);
  const coverAspectRatio = kkTokens.aspectRatio[albumCoverOrientation];
  const coverAlt = buildAlbumCoverAlt(album);
  const coverSource = buildAlbumCoverSource(album);
  const albumMeta = buildAlbumMeta(album);
  const photoCountLabel = buildPhotoCountLabel(album.photos.length);

  return (
    <KkCard>
      <KkCard.Action component={Link} to={albumHref} aria-label={album.title}>
        <KkCard.Media aspectRatio={coverAspectRatio}>
          <KkPhoto
            alt={coverAlt}
            orientation={albumCoverOrientation}
            placeholderLabel={album.slug}
            source={coverSource}
            sx={{ height: '100%', borderRadius: 0 }}
          />
        </KkCard.Media>
        <KkCard.Body>
          <KkCard.Meta>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
            >
              {albumMeta}
            </Typography>
          </KkCard.Meta>
          <KkCard.Title clamp={2}>{album.title}</KkCard.Title>
          <KkCard.Text clamp={3}>{album.intro}</KkCard.Text>
          <KkCard.Footer>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {photoCountLabel}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>
              {albumLinkLabel}
            </Typography>
          </KkCard.Footer>
        </KkCard.Body>
      </KkCard.Action>
    </KkCard>
  );
};
