import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkSx } from './kk-sx';

interface KkCoverPictureProps {
  source: string;
  sourceSet?: string;
  sizes?: string;
  alt: string;
  sx?: KkSx;
}

export const KkCoverPicture: FC<KkCoverPictureProps> = ({ source, sourceSet, sizes, alt, sx }) => (
  <Box
    component="img"
    data-kk-cover-picture
    src={source}
    srcSet={sourceSet}
    sizes={sizes}
    alt={alt}
    loading="lazy"
    decoding="async"
    sx={[
      { display: 'block', width: '100%', height: '100%', objectFit: 'cover' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  />
);
