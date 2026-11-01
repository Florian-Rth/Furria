import { KkNewsEventCard } from '@furria/ui/KkNewsEventCard';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { TIE_CANCELLED } from '@/features/news/editor-copy';
import { eventTieLinesOf } from '@/features/news/tie-lines';
import { toEventCover } from '@/lib/event-cover';
import { useNow } from '@/lib/use-now';
import { TIE_LABELS } from '../read-news-copy';
import type { ReadNewsEvent } from '../schemas';

const EVENT_PICTURE_SIZES = '(min-width: 900px) 19rem, 100vw';
const DAY_MS = 24 * 60 * 60 * 1000;

interface ReadNewsEventTieProps {
  event: ReadNewsEvent;
}

export const ReadNewsEventTie: FC<ReadNewsEventTieProps> = ({ event }) => {
  const today = useNow(DAY_MS);
  const lines = eventTieLinesOf(event, TIE_CANCELLED, today);
  const cover = toEventCover(event, EVENT_PICTURE_SIZES);
  const link = { component: Link, to: `/calendar/${event.eventId}` };

  return (
    <KkNewsEventCard
      eyebrow={TIE_LABELS.event}
      day={lines.day}
      month={lines.month}
      title={event.title}
      line={lines.line}
      ctaLabel={TIE_LABELS.eventCta}
      link={link}
      image={cover.image}
      tone={cover.tone}
      cancelledLabel={cover.cancelledLabel}
    />
  );
};
