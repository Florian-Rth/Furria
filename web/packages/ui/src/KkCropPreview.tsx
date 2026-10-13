import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkCrop } from './image-crop';
import { cropBackgroundOf } from './internal/crop-preview';
import type { KkSx } from './kk-sx';

interface KkCropPreviewProps {
  source: string;
  crop: KkCrop;
  sx?: KkSx;
}

export const KkCropPreview: FC<KkCropPreviewProps> = ({ source, crop, sx }) => {
  const background = cropBackgroundOf(crop);

  return (
    <Box
      aria-hidden
      data-kk-crop-preview
      sx={[
        {
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          backgroundImage: `url("${source}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: background.size,
          backgroundPosition: background.position,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
};
