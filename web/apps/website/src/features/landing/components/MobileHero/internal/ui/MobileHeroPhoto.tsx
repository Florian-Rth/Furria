import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WebsitePicture } from '@/components/WebsitePicture';
import { LANDING_HERO_PHONE_SIZES } from '@/lib/website-pictures/landing-hero-sizes';

export const MobileHeroPhoto: FC = () => (
  <Box data-kk-mobile-hero-photo sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <WebsitePicture slot="landing.heroPhone" sizes={LANDING_HERO_PHONE_SIZES} priority fill />
  </Box>
);
