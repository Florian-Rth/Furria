import { KkNewsEventCard } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { buildEventHref } from '@/features/events';
import { buildEventTieLine, newsTiesLabels } from '@/features/news/news-content';
import { formatDayOfMonth, formatMonthAbbreviation } from '@/lib/date';
import type { NewsEvent } from '@/lib/public-news/schemas';

interface NewsEventTieProps {
  event: NewsEvent;
}

export const NewsEventTie: FC<NewsEventTieProps> = ({ event }) => {
  const day = formatDayOfMonth(event.startsAt);
  const month = formatMonthAbbreviation(event.startsAt);
  const line = buildEventTieLine(event);
  const link = { component: Link, to: buildEventHref(event) };

  return (
    <KkNewsEventCard
      eyebrow={newsTiesLabels.event}
      day={day}
      month={month}
      title={event.title}
      line={line}
      ctaLabel={newsTiesLabels.eventCta}
      link={link}
    />
  );
};
