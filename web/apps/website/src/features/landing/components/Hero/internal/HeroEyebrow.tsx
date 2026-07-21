import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildEyebrowLabel } from '@/features/landing/hero-content';
import { currentSession, SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';

const eyebrowLabel = buildEyebrowLabel(
  currentSession.yearsLabel,
  SESSION_OPENING_DAY,
  SESSION_OPENING_MONTH,
);

export const HeroEyebrow: FC = () => (
  <Stack
    direction="row"
    sx={{
      display: 'inline-flex',
      alignSelf: 'flex-start',
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
