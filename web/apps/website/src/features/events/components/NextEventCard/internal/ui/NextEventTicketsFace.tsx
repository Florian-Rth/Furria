import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useCountdown } from '@/features/events/hooks/use-countdown';
import { fewLeftTagLabel, nextEventTicketsKicker } from '@/features/events/next-event-content';
import { deriveSalesStatusLabel } from '@/features/events/sales-status-display';
import type { Event } from '@/lib/public-events/schemas';
import { NextEventShell } from '../layout/NextEventShell';
import { NextEventDetailLink } from './NextEventDetailLink';
import { NextEventIntro } from './NextEventIntro';

interface NextEventTicketsFaceProps {
  event: Event;
}

export const NextEventTicketsFace: FC<NextEventTicketsFaceProps> = ({ event }) => {
  const countdownLabel = useCountdown(event.startsAt);
  const availabilityLabel = deriveSalesStatusLabel(event);

  const countdownLine =
    countdownLabel === null ? null : (
      <Typography variant="h3" component="p">
        Beginn {countdownLabel}
      </Typography>
    );

  const fewLeftTag =
    event.status === 'fewLeft' ? (
      <Chip size="small" color="warning" label={fewLeftTagLabel} />
    ) : null;

  return (
    <NextEventShell>
      <NextEventIntro kicker={nextEventTicketsKicker} event={event} />
      {countdownLine}
      <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {availabilityLabel}
        </Typography>
        {fewLeftTag}
      </Stack>
      <NextEventDetailLink event={event} emphasis="contained" />
    </NextEventShell>
  );
};
