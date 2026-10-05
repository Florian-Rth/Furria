import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { useHeroStats } from '@/features/landing/hooks/use-hero-stats';

export const HeroStatRow: FC = () => {
  const stats = useHeroStats();

  return (
    <KkStatRow sx={{ gap: 4 }}>
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
