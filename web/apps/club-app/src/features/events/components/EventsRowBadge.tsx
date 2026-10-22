import { KkChip } from '@furria/ui/KkChip';
import type { FC } from 'react';
import { CANCELLED_BADGE, IN_PREPARATION_BADGE } from '../event-board-copy';
import { isCancelledEvent, isInPreparation } from '../event-plan';
import type { EventSummary } from '../schemas';

interface EventsRowBadgeProps {
  event: EventSummary;
}

export const EventsRowBadge: FC<EventsRowBadgeProps> = ({ event }) => {
  if (isCancelledEvent(event)) {
    return (
      <KkChip tone="accent" size="small">
        {CANCELLED_BADGE}
      </KkChip>
    );
  }
  if (isInPreparation(event) && !event.isOver) {
    return (
      <KkChip tone="blue" size="small">
        {IN_PREPARATION_BADGE}
      </KkChip>
    );
  }

  return null;
};
