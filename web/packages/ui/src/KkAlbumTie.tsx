import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkImageSource } from './image-source';
import { KkPhoto } from './KkPhoto';

const COVER_SIZE = 48;
const COVER_SIZES = `${COVER_SIZE}px`;

interface KkAlbumTieProps {
  title: string;
  line: string;
  cover: KkImageSource | null;
}

export const KkAlbumTie: FC<KkAlbumTieProps> = ({ title, line, cover }) => {
  const image = cover === null ? null : { ...cover, sizes: cover.sizes ?? COVER_SIZES };

  return (
    <Stack direction="row" data-kk-album-tie sx={{ gap: 1.5, alignItems: 'center', minWidth: 0 }}>
      <KkPhoto
        alt=""
        image={image}
        fill
        sx={{ width: COVER_SIZE, height: COVER_SIZE, flexShrink: 0, borderRadius: 0.5 }}
      />
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
