import { KkPhotoPlaceholder } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const MobileHeroPhoto: FC = () => (
  <Box data-kk-mobile-hero-photo sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <KkPhotoPlaceholder label="garde-auf-der-buehne" fill />
  </Box>
);
