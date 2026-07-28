import { KkCard, KkPhoto, kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import {
  albumCoverOrientation,
  albumLinkLabel,
  buildAlbumCoverAlt,
  buildAlbumHref,
  buildAlbumMeta,
  buildPhotoCountLabel,
} from '@/features/gallery/gallery-content';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: FC<AlbumCardProps> = ({ album }) => (
  <KkCard>
    <KkCard.Action component={Link} to={buildAlbumHref(album.slug)} aria-label={album.title}>
      <KkCard.Media aspectRatio={kkTokens.aspectRatio[albumCoverOrientation]}>
        <KkPhoto
          alt={buildAlbumCoverAlt(album)}
          orientation={albumCoverOrientation}
          placeholderLabel={album.slug}
          sx={{ height: '100%', borderRadius: 0 }}
        />
      </KkCard.Media>
      <KkCard.Body>
        <KkCard.Meta>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}
          >
            {buildAlbumMeta(album)}
          </Typography>
        </KkCard.Meta>
        <KkCard.Title clamp={2}>{album.title}</KkCard.Title>
        <KkCard.Text clamp={3}>{album.intro}</KkCard.Text>
        <KkCard.Footer>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {buildPhotoCountLabel(album.photos.length)}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>
            {albumLinkLabel}
          </Typography>
        </KkCard.Footer>
      </KkCard.Body>
    </KkCard.Action>
  </KkCard>
);
