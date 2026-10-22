import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';

const PHOTO_STACK_SIZES = '(min-width: 1536px) 400px, 28vw';

interface PhotoStackPhotoProps {
  position: number;
}

export const PhotoStackPhoto: FC<PhotoStackPhotoProps> = ({ position }) => (
  <Box
    sx={{
      bgcolor: 'background.paper',
      border: `${kkTokens.line.hair}px solid`,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
      p: 1,
    }}
  >
    <WebsitePicture slot="gallery.stack" position={position} sizes={PHOTO_STACK_SIZES} />
  </Box>
);
