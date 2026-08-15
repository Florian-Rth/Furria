import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { performersKicker, performersTitle } from '@/features/events/event-detail-content';
import { deriveEventLineup } from '@/features/events/event-detail-display';
import type { Event } from '@/lib/seed/events';
import { EventLineupList } from '../layout/EventLineupList';
import { EventLineupEntry } from './EventLineupEntry';

interface EventPerformersProps {
  event: Event;
}

export const EventPerformers: FC<EventPerformersProps> = ({ event }) => {
  const lineup = deriveEventLineup(event);
  if (lineup === null) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header kicker={performersKicker} title={performersTitle} />
      <EventLineupList>
        {lineup.map((entry) => (
          <EventLineupEntry key={entry.act} entry={entry} />
        ))}
      </EventLineupList>
    </KkSection>
  );
};
