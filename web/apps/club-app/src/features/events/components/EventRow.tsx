import { aspectRatioCss, KkChip, KkFactRow, KkPhoto } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import { toDayNumberLabel, toWeekdayEyebrow } from '@/lib/calendar-days';
import { EVENT_STATUS_TONES, toEventStatusShortLabel } from '@/lib/event-copy';
import { toEventCover } from '@/lib/event-cover';
import { toEventRowMeta } from '../events-labels';
import type { EventSummary } from '../schemas';

const LANDING_KIND = 'event';
const THUMB_SIZES = '4rem';
const THUMB_ASPECT_RATIO = aspectRatioCss('banner');

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
  const cover = toEventCover(
    { eventId: event.eventId, picture: event.picture, isCancelled: event.status === 'cancelled' },
    THUMB_SIZES,
  );
  const isCancelled = cover.cancelledLabel !== null;
  const thumb = (
    <KkPhoto
      alt=""
      image={cover.image}
      size="thumb"
      aspectRatio={THUMB_ASPECT_RATIO}
      tone={cover.tone}
      dimmed={isCancelled}
    />
  );

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
      thumb={thumb}
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
