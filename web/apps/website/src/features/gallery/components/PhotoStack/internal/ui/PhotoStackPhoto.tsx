import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { PhotoOrientation } from '@/features/gallery/gallery-content';

interface PhotoStackPhotoProps {
  label: string;
  orientation: PhotoOrientation;
}

export const PhotoStackPhoto: FC<PhotoStackPhotoProps> = ({ label, orientation }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      border: kkTokens.line.hair,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
      p: 1,
    }}
  >
    <KkPhotoPlaceholder label={label} aspectRatio={kkTokens.aspectRatio[orientation]} />
  </Box>
);
