import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkCoverPicture } from './KkCoverPicture';
import { KkIcon } from './KkIcon';

const COVER_SIZE = 48;

interface KkAlbumTieProps {
  title: string;
  line: string;
  cover: string | null;
}

export const KkAlbumTie: FC<KkAlbumTieProps> = ({ title, line, cover }) => {
  const face =
    cover === null ? (
      <KkIcon name="gallery" size="small" />
    ) : (
      <KkCoverPicture source={cover} alt="" sx={{ borderRadius: 0.5 }} />
    );

  return (
    <Stack direction="row" data-kk-album-tie sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
      <Stack
        sx={{
          width: COVER_SIZE,
          height: COVER_SIZE,
          flexShrink: 0,
          borderRadius: 0.5,
          color: 'text.secondary',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
        }}
      >
        {face}
      </Stack>
      <Stack sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
          {line}
        </Typography>
      </Stack>
    </Stack>
  );
};
