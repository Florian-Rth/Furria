import { kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { MitmachenCopy } from './internal/ui/MitmachenCopy';
import { MitmachenCta } from './internal/ui/MitmachenCta';
import { MitmachenWatermark } from './internal/ui/MitmachenWatermark';

export const MitmachenBand: FC = () => (
  <Stack
    component="section"
    data-kk-mitmachen-band
    sx={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: `${kkTokens.radius.base}px`,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: { xs: 4, md: 7 },
      py: { xs: 5, md: 7 },
    }}
  >
    <MitmachenWatermark />
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: 3, md: 6 },
      }}
    >
      <MitmachenCopy />
      <MitmachenCta />
    </Stack>
  </Stack>
);
