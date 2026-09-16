import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { useStoryStats } from '../logic/use-story-stats';

export const ClubStoryStats: FC = () => {
  const stats = useStoryStats();

  return (
    <KkStatRow>
      {stats.map((stat) => (
        <KkStatRow.Item key={stat.label}>
          <KkStatRow.Value variant="h3">{stat.value}</KkStatRow.Value>
          <KkStatRow.Label sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
            {stat.label}
          </KkStatRow.Label>
        </KkStatRow.Item>
      ))}
    </KkStatRow>
  );
};
