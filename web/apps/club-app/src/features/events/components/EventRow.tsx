import { KkChip, KkFactRow } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { EVENT_STATUS_TONES, toEventStatusShortLabel } from '@/lib/event-copy';
import { toEventRowMeta } from '../events-labels';
import type { EventSummary } from '../schemas';

const LANDING_KIND = 'event';

interface EventRowProps {
  event: EventSummary;
  highlightedKey: string | null;
}

export const EventRow: FC<EventRowProps> = ({ event, highlightedKey }) => {
  const landingKey = toLandingKey(LANDING_KIND, event.eventId);
  const statusLabel = toEventStatusShortLabel(event);
  const statusTone = EVENT_STATUS_TONES[event.status];
  const span = toDayNumberLabel(event.startsAt);
  const spanLabel = toWeekdayEyebrow(event.startsAt);
  const meta = toEventRowMeta(event);
  const params = { eventId: String(event.eventId) };

  const chip = (
    <KkChip tone={statusTone} size="small">
      {statusLabel}
    </KkChip>
  );

  return (
    <KkFactRow
      title={event.title}
      span={span}
      spanLabel={spanLabel}
      meta={meta}
      chip={chip}
      dimmed={event.isOver}
      highlight={highlightedKey === landingKey}
      landing={landingKey}
      component={Link}
      to="/events/$eventId"
      params={params}
    />
  );
};
