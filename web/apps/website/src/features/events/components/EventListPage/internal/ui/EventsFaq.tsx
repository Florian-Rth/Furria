import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { EVENTS_FAQ, eventsFaqKicker, eventsFaqTitle } from '@/features/events/faq-content';
import { EventsFaqList } from '../layout/EventsFaqList';
import { EventsFaqItem } from './EventsFaqItem';

export const EventsFaq: FC = () => (
  <KkSection>
    <KkSection.Header kicker={eventsFaqKicker} title={eventsFaqTitle} />
    <EventsFaqList>
      {EVENTS_FAQ.map((entry) => (
        <EventsFaqItem key={entry.id} entry={entry} />
      ))}
    </EventsFaqList>
  </KkSection>
);
