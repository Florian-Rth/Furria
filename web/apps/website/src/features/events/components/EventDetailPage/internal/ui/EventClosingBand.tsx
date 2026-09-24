import { KkBandSection, KkBandWatermark, KkEyebrow, kkTokens } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { BandCta } from '@/components/BandCta';
import { closingBandBeginsPrefix, closingBandKicker } from '@/features/events/event-detail-content';
import { useCountdown } from '@/features/events/hooks/use-countdown';
import {
  deriveTicketPanelCta,
  deriveTicketPanelFace,
  deriveTicketPanelNote,
} from '@/features/events/ticket-panel-display';
import type { Event } from '@/lib/seed/events';

interface EventClosingBandProps {
  event: Event;
}

export const EventClosingBand: FC<EventClosingBandProps> = ({ event }) => {
  const countdownLabel = useCountdown(event.startsAt);
  const cta = deriveTicketPanelCta(event);
  const note = deriveTicketPanelNote(deriveTicketPanelFace(event));

  const beginsLabel =
    countdownLabel === null ? null : `${closingBandBeginsPrefix} ${countdownLabel}`;

  const countdownLine =
    beginsLabel === null ? null : (
      <Typography variant="h3" component="p">
        {beginsLabel}
      </Typography>
    );

  const noteLine =
    note === null ? null : (
      <Typography variant="body1" sx={{ opacity: kkTokens.opacity.onAccent }}>
        {note}
      </Typography>
    );

  const ctaButton =
    cta === null ? null : (
      <BandCta to={cta.to} emphasis="solid">
        {cta.label}
      </BandCta>
    );

  return (
    <KkBandSection decoration={<KkBandWatermark />}>
      <KkBandSection.Row>
        <Stack sx={{ gap: 1.5, maxWidth: { md: '40rem' } }}>
          <KkEyebrow tone="onAccent">{closingBandKicker}</KkEyebrow>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              typography: { xs: 'h2', md: 'h1' },
              textWrap: 'balance',
              textTransform: 'uppercase',
            }}
          >
            {event.title}
          </Typography>
          {countdownLine}
          {noteLine}
        </Stack>
        {ctaButton}
      </KkBandSection.Row>
    </KkBandSection>
  );
};
