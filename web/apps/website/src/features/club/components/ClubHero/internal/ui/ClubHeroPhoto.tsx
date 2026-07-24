import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { clubHeroPhotoCaption } from '@/features/club/hero-content';

export const ClubHeroPhoto: FC = () => (
  <Box
    sx={{
      border: 1,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      overflow: 'hidden',
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <KkPhotoPlaceholder label={clubHeroPhotoCaption} aspectRatio={kkTokens.aspectRatio.landscape} />
  </Box>
);
