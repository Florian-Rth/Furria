import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';

interface AlbumIntroProps {
  album: Album;
}

export const AlbumIntro: FC<AlbumIntroProps> = ({ album }) => (
  <Typography
    component="p"
    data-kk-album-intro
    sx={{
      fontSize: { xs: '1rem', md: '1.0625rem' },
      fontWeight: 500,
      lineHeight: 1.6,
      color: 'text.secondary',
      maxWidth: '44rem',
      textWrap: 'pretty',
    }}
  >
    {album.intro}
  </Typography>
);
