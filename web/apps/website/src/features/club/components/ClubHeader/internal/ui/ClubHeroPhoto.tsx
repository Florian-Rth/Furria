import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { clubHeroPhotoCaption } from '@/features/club/header-content';

export const ClubHeroPhoto: FC = () => (
  <Box
    sx={{
      display: { xs: 'none', md: 'block' },
      position: 'relative',
      zIndex: 1,
      border: kkTokens.line.hair,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <KkPhotoPlaceholder label={clubHeroPhotoCaption} aspectRatio={kkTokens.aspectRatio.landscape} />
  </Box>
);
