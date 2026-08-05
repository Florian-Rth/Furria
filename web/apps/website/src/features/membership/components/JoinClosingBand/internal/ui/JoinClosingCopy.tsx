import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { joinClosingBandContent } from '@/features/membership/closing-content';

export const JoinClosingCopy: FC = () => (
  <Stack sx={{ gap: 1.5, maxWidth: { md: '38rem' } }}>
    <KkEyebrow tone="onAccent">{joinClosingBandContent.kicker}</KkEyebrow>
    <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
      {joinClosingBandContent.headline}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 500, opacity: 0.92, textWrap: 'pretty' }}>
      {joinClosingBandContent.lead}
    </Typography>
  </Stack>
);
