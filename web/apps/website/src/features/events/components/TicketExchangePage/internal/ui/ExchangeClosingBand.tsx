import { KkBandSection, KkBandWatermark, KkEyebrow, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { exchangeClosingContent } from '@/features/events/exchange-content';

export const ExchangeClosingBand: FC = () => (
  <KkBandSection decoration={<KkBandWatermark />}>
    <KkBandSection.Row>
      <Stack sx={{ gap: 1.5, maxWidth: { md: '40rem' } }}>
        <KkEyebrow tone="onAccent">{exchangeClosingContent.kicker}</KkEyebrow>
        <Typography variant="h2" component="h2" sx={{ textWrap: 'balance' }}>
          {exchangeClosingContent.headline}
        </Typography>
        <Typography variant="body1" sx={{ opacity: kkTokens.opacity.onAccent }}>
          {exchangeClosingContent.lead}
        </Typography>
      </Stack>
      <BandCta to={exchangeClosingContent.ctaTo}>{exchangeClosingContent.ctaLabel}</BandCta>
    </KkBandSection.Row>
  </KkBandSection>
);
