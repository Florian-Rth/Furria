import { KkTwoToneHeadline, kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const MobileHeroHeadline: FC = () => (
  <Box sx={{ textShadow: kkTokens.overlay.textShadow }}>
    <KkTwoToneHeadline line1="GROSS" line2="FURRIA!" line1Color={kkTokens.overlay.onPhotoText} />
  </Box>
);
