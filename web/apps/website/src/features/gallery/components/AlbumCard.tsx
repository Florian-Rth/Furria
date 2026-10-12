import { KkCard, KkPhoto, kkTokens, toImageSource } from '@furria/ui';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  albumCoverOrientation,
  albumLinkLabel,
  buildAlbumCoverAlt,
  buildAlbumHref,
  buildAlbumMeta,
  buildPhotoCountLabel,
  galleryCoverSizes,
} from '@/features/gallery/gallery-content';
import { publicGallery } from '@/lib/public-gallery/api';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface AlbumCardProps {
  album: AlbumSummary;
}

export const AlbumCard: FC<AlbumCardProps> = ({ album }) => {
  const albumHref = buildAlbumHref(album);
  const albumSlug = publicGallery.slugOf(album);
  const coverAspectRatio = kkTokens.aspectRatio[albumCoverOrientation];
  const coverAlt = buildAlbumCoverAlt(album);
  const cover = toImageSource(album.cover, album.cover.aspect, galleryCoverSizes);
  const albumMeta = buildAlbumMeta(album);
  const photoCountLabel = buildPhotoCountLabel(album.photoCount);

  return (
    <KkCard>
      <KkCard.Action component={Link} to={albumHref} aria-label={album.title}>
        <KkCard.Media aspectRatio={coverAspectRatio}>
          <KkPhoto
            alt={coverAlt}
            orientation={albumCoverOrientation}
            placeholderLabel={albumSlug}
            image={cover}
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
