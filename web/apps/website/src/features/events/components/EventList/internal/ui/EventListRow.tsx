import { kkTokens } from '@furria/ui';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { EventDateBlock } from '@/features/events/components/EventDateBlock';
import { SalesStatusBadge } from '@/features/events/components/SalesStatusBadge';
import {
  buildEventAnchorId,
  buildEventHref,
  deriveProximityLabel,
  deriveTimesLabel,
} from '@/features/events/event-display';
import { deriveSalesStatusLabel } from '@/features/events/sales-status-display';
import { formatLongDate } from '@/lib/date';
import type { Event } from '@/lib/public-events/schemas';

interface EventListRowProps {
  event: Event;
  now: Date;
  highlightedAnchorId: string | null;
}

export const EventListRow: FC<EventListRowProps> = ({ event, now, highlightedAnchorId }) => {
  const theme = useTheme();
  const anchorId = buildEventAnchorId(event.eventId);
  const highlighted = anchorId === highlightedAnchorId;
  const timesLabel = deriveTimesLabel(event);
  const proximityLabel =
    event.status === 'cancelled' ? null : deriveProximityLabel(event.startsAt, now);
  const rowLabel = `${event.title} · ${formatLongDate(event.startsAt)} · ${deriveSalesStatusLabel(event)}`;

  const ageHintChip =
    event.ageHint === null ? null : (
      <Chip
        size="small"
        variant="outlined"
        label={event.ageHint}
        sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'text.secondary' }}
      />
    );

  const proximityChip =
    proximityLabel === null ? null : (
      <Chip
        size="small"
        color="primary"
        label={proximityLabel}
        sx={{ display: { xs: 'none', md: 'inline-flex' } }}
      />
    );

  return (
    <CardActionArea
      id={anchorId}
      data-kk-event-row
      component={Link}
      to={buildEventHref(event)}
      aria-label={rowLabel}
      sx={{
        borderRadius: `${kkTokens.radius.base}px`,
        p: { xs: 2, md: 2.5 },
        bgcolor: highlighted ? 'action.selected' : undefined,
        transition: theme.transitions.create(['background-color'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          bgcolor: 'action.hover',
          '& [data-kk-event-row-title]': { color: 'primary.main' },
        },
        '&.Mui-focusVisible': {
          outlineWidth: 2,
          outlineStyle: 'solid',
          outlineColor: (theme.vars ?? theme).palette.primary.main,
          outlineOffset: 2,
        },
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: '100%',
          gap: { xs: 2, md: 3 },
          alignItems: 'flex-start',
          flexWrap: { xs: 'wrap', desktop: 'nowrap' },
        }}
      >
        <EventDateBlock startsAt={event.startsAt} />
        <Stack sx={{ gap: 0.75, minWidth: 0, flexGrow: 1, flexBasis: '12rem' }}>
          <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography
              variant="h3"
              component="h3"
              data-kk-event-row-title
              sx={{
                typography: { xs: 'h3', md: 'h2' },
                lineHeight: 1.05,
                transition: theme.transitions.create(['color'], {
                  duration: theme.transitions.duration.shortest,
                }),
              }}
            >
              {event.title}
            </Typography>
            {ageHintChip}
          </Stack>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            {timesLabel}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              display: { xs: 'none', md: 'block' },
              color: 'text.secondary',
              textWrap: 'pretty',
              maxWidth: '40rem',
            }}
          >
            {event.teaser}
          </Typography>
        </Stack>
        <Stack
          sx={{
            gap: 1,
            flexShrink: 0,
            flexBasis: { xs: '100%', desktop: '11rem' },
            alignItems: { xs: 'flex-start', desktop: 'flex-end' },
          }}
        >
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {proximityChip}
            <SalesStatusBadge event={event} />
          </Stack>
        </Stack>
      </Stack>
    </CardActionArea>
  );
};
