import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useCountdown } from '@/features/events/hooks/use-countdown';
import { nextEventPresaleKicker } from '@/features/events/next-event-content';
import { deriveSalesStatusLabel } from '@/features/events/sales-status-display';
import type { Event } from '@/lib/seed/events';
import { NextEventShell } from '../layout/NextEventShell';
import { NextEventDetailLink } from './NextEventDetailLink';
import { NextEventIntro } from './NextEventIntro';

interface NextEventPresaleFaceProps {
  event: Event;
  presaleStartsAt: string;
}

export const NextEventPresaleFace: FC<NextEventPresaleFaceProps> = ({ event, presaleStartsAt }) => {
  const countdownLabel = useCountdown(presaleStartsAt);
  const presaleDateLabel = deriveSalesStatusLabel(event);

  const countdownLine =
    countdownLabel === null ? null : (
      <Typography variant="h5" component="p">
        {countdownLabel}
      </Typography>
    );

  return (
    <NextEventShell>
      <NextEventIntro kicker={nextEventPresaleKicker} event={event} />
      {countdownLine}
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {presaleDateLabel}
      </Typography>
      <NextEventDetailLink eventId={event.id} emphasis="outlined" />
    </NextEventShell>
  );
};
