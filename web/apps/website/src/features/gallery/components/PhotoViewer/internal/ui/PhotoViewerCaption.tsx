import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface PhotoViewerCaptionProps {
  caption: string | null;
}

export const PhotoViewerCaption: FC<PhotoViewerCaptionProps> = ({ caption }) => {
  if (caption === null) {
    return null;
  }

  return (
    <Typography
      variant="body1"
      component="p"
      data-kk-photo-viewer-caption
      sx={{
        fontWeight: 600,
        lineHeight: 1.5,
        textWrap: 'pretty',
        maxWidth: '52rem',
      }}
    >
      {caption}
    </Typography>
  );
};
