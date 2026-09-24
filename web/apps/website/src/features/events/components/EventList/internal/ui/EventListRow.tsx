import { kkTokens } from '@furria/ui';
import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { CapacityBar } from '@/features/events/components/CapacityBar';
import { EventDateBlock } from '@/features/events/components/EventDateBlock';
import { SalesStatusBadge } from '@/features/events/components/SalesStatusBadge';
import {
  buildEventHref,
  deriveProximityLabel,
  deriveTimesLabel,
} from '@/features/events/event-display';
import {
  deriveCapacityBarColor,
  deriveSalesStatusLabel,
  isLiveSaleStatus,
} from '@/features/events/sales-status-display';
import { formatLongDate } from '@/lib/date';
import { resolveEventTypeTint } from '@/lib/event-tint';
import type { Event } from '@/lib/seed/events';

interface EventListRowProps {
  event: Event;
  now: Date;
  highlighted: boolean;
}

export const EventListRow: FC<EventListRowProps> = ({ event, now, highlighted }) => {
  const theme = useTheme();
  const tint = resolveEventTypeTint(theme, event.type);
  const timesLabel = deriveTimesLabel(event);
  const proximityLabel =
    event.salesStatus === 'cancelled' ? null : deriveProximityLabel(event.startsAt, now);
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

  const capacityBar =
    isLiveSaleStatus(event.salesStatus) && event.freeCount !== null && event.capacity !== null ? (
      <Box sx={{ display: { xs: 'none', md: 'block' }, width: '100%' }}>
        <CapacityBar
          freeCount={event.freeCount}
          capacity={event.capacity}
          color={deriveCapacityBarColor(event.salesStatus)}
        />
      </Box>
    ) : null;

  return (
    <CardActionArea
      id={event.id}
      data-kk-event-row
      component={Link}
      to={buildEventHref(event.id)}
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
        <EventDateBlock startsAt={event.startsAt} tint={tint} />
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
          {capacityBar}
        </Stack>
      </Stack>
    </CardActionArea>
  );
};
