import { KkChip, KkEyebrow, KkMeta, KkScreenHeader } from '@furria/ui';
import type { FC } from 'react';
import { EVENT_STATUS_TONES, toEventStatusLabel } from '@/lib/event-copy';
import { EVENT_EYEBROW, toEventPlaceLine } from '../events-labels';
import type { EventDetails } from '../schemas';

interface EventHeaderProps {
  event: EventDetails;
}

export const EventHeader: FC<EventHeaderProps> = ({ event }) => {
  const statusTone = EVENT_STATUS_TONES[event.status];
  const statusLabel = toEventStatusLabel(event);
  const placeLine = toEventPlaceLine(event);

  return (
    <KkScreenHeader>
      <KkScreenHeader.Text>
        <KkEyebrow tone="accent">{EVENT_EYEBROW}</KkEyebrow>
        <KkScreenHeader.Title transform="none">{event.title}</KkScreenHeader.Title>
        <KkScreenHeader.Meta>
          <KkChip tone={statusTone} dot>
            {statusLabel}
          </KkChip>
          <KkMeta>{placeLine}</KkMeta>
        </KkScreenHeader.Meta>
      </KkScreenHeader.Text>
    </KkScreenHeader>
  );
};
