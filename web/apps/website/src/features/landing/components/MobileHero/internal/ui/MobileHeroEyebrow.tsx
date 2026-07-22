import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { eyebrowLabel } from '@/features/landing/hero-content';

export const MobileHeroEyebrow: FC = () => (
  <Typography
    variant="caption"
    sx={{ fontWeight: 800, letterSpacing: '0.14em', color: kkTokens.overlay.onPhotoText }}
  >
    {eyebrowLabel}
  </Typography>
);
