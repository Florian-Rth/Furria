import { KkCountdownFuse } from '@furria/ui/KkCountdownFuse';
import type { FC } from 'react';
import type { RowView } from '../event-board-copy';

interface EventCountdownProps {
  view: RowView;
  remaining: number | null;
}

export const EventCountdown: FC<EventCountdownProps> = ({ view, remaining }) => (
  <KkCountdownFuse
    value={view.count}
    unit={view.countUnit}
    label={view.countLabel}
    remaining={remaining}
    tone={view.countTone}
  />
);
