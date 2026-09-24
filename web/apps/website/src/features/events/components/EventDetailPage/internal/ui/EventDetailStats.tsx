import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { deriveEventStats } from '@/features/events/event-detail-display';
import type { Event } from '@/lib/seed/events';

interface EventDetailStatsProps {
  event: Event;
}

export const EventDetailStats: FC<EventDetailStatsProps> = ({ event }) => {
  const stats = deriveEventStats(event);

  return (
    <KkStatRow sx={{ gap: { xs: 3, md: 4 } }}>
      {stats.map((stat) => (
        <KkStatRow.Item key={stat.label}>
          <KkStatRow.Value variant="h3">{stat.value}</KkStatRow.Value>
          <KkStatRow.Label>{stat.label}</KkStatRow.Label>
        </KkStatRow.Item>
      ))}
    </KkStatRow>
  );
};
