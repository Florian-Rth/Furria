import { KkEyebrow } from '@furria/ui';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { deriveTimesLabel } from '@/features/events/event-display';
import { formatLongDate, formatWeekdayLong } from '@/lib/date';
import type { Event } from '@/lib/seed/events';

interface NextEventIntroProps {
  kicker: string;
  event: Event;
}

export const NextEventIntro: FC<NextEventIntroProps> = ({ kicker, event }) => {
  const dateLine = `${formatWeekdayLong(event.startsAt)}, ${formatLongDate(event.startsAt)} · ${deriveTimesLabel(event)}`;

  return (
    <Stack sx={{ gap: 1 }}>
      <KkEyebrow tone="accent">{kicker}</KkEyebrow>
      <Typography variant="h2" component="h2">
        {event.title}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        {dateLine}
      </Typography>
    </Stack>
  );
};
