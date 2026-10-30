import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioGViewerCaptionProps {
  text: string;
}

export const KkStudioGViewerCaption: FC<KkStudioGViewerCaptionProps> = ({ text }) => (
  <Typography
    variant="caption"
    noWrap
    data-kk-studio-g-viewer-caption
    sx={{ flex: 1, minWidth: 0, pb: 0.5, color: 'text.secondary', fontWeight: 700 }}
  >
    {text}
  </Typography>
);
