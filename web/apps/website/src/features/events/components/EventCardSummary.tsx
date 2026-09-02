import { KkCard } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { EventDateBlock } from '@/features/events/components/EventDateBlock';
import { deriveTimesLabel } from '@/features/events/event-display';
import { deriveSalesShortLabel } from '@/features/events/sales-status-display';
import { resolveEventTypeTint } from '@/lib/event-tint';
import type { Event } from '@/lib/seed/events';

interface EventCardSummaryProps {
  event: Event;
}

export const EventCardSummary: FC<EventCardSummaryProps> = ({ event }) => {
  const theme = useTheme();
  const tint = resolveEventTypeTint(theme, event.type);
  const timesLabel = deriveTimesLabel(event);
  const statusLabel = deriveSalesShortLabel(event);

  return (
    <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
      <EventDateBlock startsAt={event.startsAt} tint={tint} />
      <Stack sx={{ gap: 0.5, minWidth: 0 }}>
        <KkCard.Title clamp={2}>{event.title}</KkCard.Title>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          {timesLabel}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>
          {statusLabel}
        </Typography>
      </Stack>
    </Stack>
  );
};
