import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Photo } from '@/features/gallery/gallery-content';

interface PhotoViewerCaptionProps {
  photo: Photo;
}

export const PhotoViewerCaption: FC<PhotoViewerCaptionProps> = ({ photo }) => (
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
    {photo.alt}
  </Typography>
);
