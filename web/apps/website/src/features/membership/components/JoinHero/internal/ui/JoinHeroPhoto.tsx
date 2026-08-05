import { KkPhotoPlaceholder, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { joinHeroPhotoCaption } from '@/features/membership/join-content';

export const JoinHeroPhoto: FC = () => (
  <Box
    aria-hidden
    sx={{
      display: { xs: 'none', desktop: 'block' },
      position: 'relative',
      zIndex: 1,
      border: kkTokens.line.hair,
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.base}px`,
      boxShadow: kkTokens.shadow.raised,
    }}
  >
    <KkPhotoPlaceholder label={joinHeroPhotoCaption} aspectRatio={kkTokens.aspectRatio.landscape} />
  </Box>
);
