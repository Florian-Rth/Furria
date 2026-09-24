import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { deriveHeroStats } from '@/features/events/hero-display';
import type { Event } from '@/lib/seed/events';

interface EventsHeroStatsProps {
  events: Event[];
}

export const EventsHeroStats: FC<EventsHeroStatsProps> = ({ events }) => {
  const stats = deriveHeroStats(events);
  if (stats.length === 0) {
    return null;
  }

  return (
    <KkStatRow sx={{ gap: { xs: 3, md: 4 } }}>
      {stats.map((stat) => (
        <KkStatRow.Item key={stat.label}>
          <KkStatRow.Value variant="h2" sx={{ color: 'primary.main' }}>
            {stat.value}
          </KkStatRow.Value>
          <KkStatRow.Label>{stat.label}</KkStatRow.Label>
        </KkStatRow.Item>
      ))}
    </KkStatRow>
  );
};
