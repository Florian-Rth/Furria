import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { useJoinStats } from '@/features/membership/hooks/use-join-stats';

export const JoinHeroStats: FC = () => {
  const joinStats = useJoinStats();

  return (
    <KkStatRow sx={{ gap: { xs: 3, md: 4 } }}>
      {joinStats.map((stat) => (
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
