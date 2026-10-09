import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { AlbumDetail } from '@/lib/public-gallery/schemas';

interface AlbumIntroProps {
  album: AlbumDetail;
}

export const AlbumIntro: FC<AlbumIntroProps> = ({ album }) => {
  if (album.paragraphs === null) {
    return null;
  }

  return (
    <Stack data-kk-album-intro sx={{ gap: 1.5, maxWidth: '44rem' }}>
      {album.paragraphs.map((paragraph) => (
        <Typography
          key={paragraph}
          variant="body1"
          component="p"
          sx={{
            fontWeight: 500,
            lineHeight: 1.6,
            color: 'text.secondary',
            textWrap: 'pretty',
            whiteSpace: 'pre-line',
          }}
        >
          {paragraph}
        </Typography>
      ))}
    </Stack>
  );
};
