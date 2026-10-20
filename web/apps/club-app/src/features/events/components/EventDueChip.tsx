import { KkDueChip } from '@furria/ui';
import type { FC } from 'react';
import type { DueView } from '../event-board-copy';

interface EventDueChipProps {
  due: DueView | null;
}

export const EventDueChip: FC<EventDueChipProps> = ({ due }) => {
  if (due === null) {
    return null;
  }

  return <KkDueChip state={due.state} text={due.text} label={due.label} />;
};
