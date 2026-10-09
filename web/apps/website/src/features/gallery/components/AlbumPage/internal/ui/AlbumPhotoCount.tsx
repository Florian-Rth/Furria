import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { albumPhotoCountCaption } from '@/features/gallery/gallery-content';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';

interface AlbumPhotoCountProps {
  album: AlbumDetail;
}

export const AlbumPhotoCount: FC<AlbumPhotoCountProps> = ({ album }) => (
  <Stack
    data-kk-album-photo-count
    sx={{
      flexShrink: 0,
      gap: 0.5,
      alignItems: { xs: 'flex-start', sm: 'flex-end' },
    }}
  >
    <Typography variant="h2" component="span" sx={{ color: 'primary.main', lineHeight: 0.9 }}>
      {album.photos.length}
    </Typography>
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: '0.12em', color: 'text.secondary' }}
    >
      {albumPhotoCountCaption}
    </Typography>
  </Stack>
);
