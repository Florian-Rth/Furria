import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { CapacityBar } from '@/features/events/components/CapacityBar';
import { useCountdown } from '@/features/events/hooks/use-countdown';
import {
  almostSoldOutTagLabel,
  nextEventTicketsKicker,
} from '@/features/events/next-event-content';
import {
  deriveCapacityBarColor,
  deriveSalesStatusLabel,
  isLiveSaleStatus,
} from '@/features/events/sales-status-display';
import type { Event } from '@/lib/seed/events';
import { NextEventShell } from '../layout/NextEventShell';
import { NextEventDetailLink } from './NextEventDetailLink';
import { NextEventIntro } from './NextEventIntro';
import { NextEventOrderLink } from './NextEventOrderLink';

interface NextEventTicketsFaceProps {
  event: Event;
}

export const NextEventTicketsFace: FC<NextEventTicketsFaceProps> = ({ event }) => {
  const countdownLabel = useCountdown(event.startsAt);
  const freeSeatsLabel = deriveSalesStatusLabel(event);

  const countdownLine =
    countdownLabel === null ? null : (
      <Typography variant="h5" component="p">
        Beginn {countdownLabel}
      </Typography>
    );

  const almostSoldOutTag =
    event.salesStatus === 'almostSoldOut' ? (
      <Chip size="small" color="warning" label={almostSoldOutTagLabel} />
    ) : null;

  const capacityBar =
    isLiveSaleStatus(event.salesStatus) && event.freeCount !== null && event.capacity !== null ? (
      <CapacityBar
        freeCount={event.freeCount}
        capacity={event.capacity}
        color={deriveCapacityBarColor(event.salesStatus)}
      />
    ) : null;

  return (
    <NextEventShell>
      <NextEventIntro kicker={nextEventTicketsKicker} event={event} />
      {countdownLine}
      <Stack sx={{ gap: 1, width: '100%' }}>
        {capacityBar}
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {freeSeatsLabel}
          </Typography>
          {almostSoldOutTag}
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap' }}>
        <NextEventOrderLink eventId={event.id} />
        <NextEventDetailLink eventId={event.id} emphasis="outlined" />
      </Stack>
    </NextEventShell>
  );
};
