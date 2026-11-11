import { kkTokens } from '@furria/ui/tokens';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { LandingStampHeadline } from '../../../LandingStampHeadline';

export const MobileHeroHeadline: FC = () => (
  <Box sx={{ textShadow: kkTokens.overlay.textShadow }}>
    <LandingStampHeadline line1Color={kkTokens.overlay.onPhotoText} />
  </Box>
);
