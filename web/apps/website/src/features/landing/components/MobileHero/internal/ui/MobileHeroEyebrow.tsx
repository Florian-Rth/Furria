import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useEyebrowLabel } from '@/features/landing/hooks/use-eyebrow-label';

export const MobileHeroEyebrow: FC = () => {
  const eyebrowLabel = useEyebrowLabel();

  return (
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: '0.14em', color: kkTokens.overlay.onPhotoText }}
    >
      {eyebrowLabel}
    </Typography>
  );
};
