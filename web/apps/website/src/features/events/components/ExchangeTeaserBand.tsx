import { KkBandSection, KkBandWatermark, KkEyebrow, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { exchangeBandContent } from '@/features/events/exchange-content';

export const ExchangeTeaserBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <Stack sx={{ gap: 1.5, maxWidth: { md: '40rem' } }}>
        <KkEyebrow tone="onAccent">{exchangeBandContent.kicker}</KkEyebrow>
        <Typography
          variant="h2"
          component="h2"
          sx={{ typography: { xs: 'h2', md: 'h1' }, textWrap: 'balance' }}
        >
          {exchangeBandContent.headline}
        </Typography>
        <Typography variant="body1" sx={{ opacity: kkTokens.opacity.onAccent }}>
          {exchangeBandContent.note}
        </Typography>
      </Stack>
      <BandCta to={exchangeBandContent.ctaTo} emphasis="outlined">
        {exchangeBandContent.ctaLabel}
      </BandCta>
    </KkBandSection.Row>
  </KkBandSection>
);
