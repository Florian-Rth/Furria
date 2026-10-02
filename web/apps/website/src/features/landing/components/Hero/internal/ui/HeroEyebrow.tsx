import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useEyebrowLabel } from '@/features/landing/hooks/use-eyebrow-label';

export const HeroEyebrow: FC = () => {
  const eyebrowLabel = useEyebrowLabel();

  return (
    <Stack
      direction="row"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        bgcolor: 'text.primary',
        color: 'background.default',
        borderRadius: `${kkTokens.radius.pill}px`,
        px: 2,
        py: 0.75,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.14em' }}>
        {eyebrowLabel}
      </Typography>
    </Stack>
  );
};
