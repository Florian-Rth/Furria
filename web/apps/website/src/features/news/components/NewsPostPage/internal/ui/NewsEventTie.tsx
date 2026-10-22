import { eventToneOf } from '@furria/ui/group-tone';
import { toImageSource } from '@furria/ui/image-source';
import { KkNewsEventCard } from '@furria/ui/KkNewsEventCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventHref } from '@/features/events/event-display';
import { buildEventTieLine, newsTiesLabels } from '@/features/news/news-content';
import { formatDayOfMonth, formatMonthAbbreviation } from '@/lib/date';
import type { NewsEvent } from '@/lib/public-news/schemas';

const EVENT_TIE_PICTURE_SIZES = '(min-width: 900px) 19rem, (min-width: 600px) 42vw, 100vw';

interface NewsEventTieProps {
  event: NewsEvent;
}

export const NewsEventTie: FC<NewsEventTieProps> = ({ event }) => {
  const day = formatDayOfMonth(event.startsAt);
  const month = formatMonthAbbreviation(event.startsAt);
  const line = buildEventTieLine(event);
  const link = { component: Link, to: buildEventHref(event) };
  const image = toImageSource(event.picture, 'banner', EVENT_TIE_PICTURE_SIZES);
  const tone = eventToneOf(event.eventId);
  const cancelledLabel = event.isCancelled ? newsTiesLabels.cancelled : null;

  return (
    <KkNewsEventCard
      eyebrow={newsTiesLabels.event}
      day={day}
      month={month}
      title={event.title}
      line={line}
      ctaLabel={newsTiesLabels.eventCta}
      link={link}
      image={image}
      tone={tone}
      cancelledLabel={cancelledLabel}
    />
  );
};
