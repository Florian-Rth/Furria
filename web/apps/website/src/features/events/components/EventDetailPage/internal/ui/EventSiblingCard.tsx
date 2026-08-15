import { KkCard } from '@furria/ui';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventDateBlock } from '@/features/events/components/EventDateBlock';
import { buildEventHref, deriveTimesLabel } from '@/features/events/event-display';
import { deriveSalesShortLabel } from '@/features/events/sales-status-display';
import { resolveEventTypeTint } from '@/lib/event-tint';
import type { Event } from '@/lib/seed/events';

interface EventSiblingCardProps {
  event: Event;
}

export const EventSiblingCard: FC<EventSiblingCardProps> = ({ event }) => {
  const theme = useTheme();
  const tint = resolveEventTypeTint(theme, event.type);
  const timesLabel = deriveTimesLabel(event);
  const statusLabel = deriveSalesShortLabel(event);

  return (
    <KkCard>
      <KkCard.Action component={Link} to={buildEventHref(event.id)} aria-label={event.title}>
        <KkCard.Body>
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
        </KkCard.Body>
      </KkCard.Action>
    </KkCard>
  );
};
