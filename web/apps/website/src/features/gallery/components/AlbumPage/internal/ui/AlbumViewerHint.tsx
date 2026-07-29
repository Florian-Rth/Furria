import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { albumViewerHint } from '@/features/gallery/gallery-content';

export const AlbumViewerHint: FC = () => (
  <Typography
    variant="caption"
    data-kk-album-viewer-hint
    sx={{ fontWeight: 600, color: 'text.secondary', textWrap: 'pretty' }}
  >
    {albumViewerHint}
  </Typography>
);
