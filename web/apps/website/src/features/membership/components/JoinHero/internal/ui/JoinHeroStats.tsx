import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { joinStats } from '@/features/membership/join-content';

export const JoinHeroStats: FC = () => (
  <KkStatRow sx={{ gap: { xs: 3, md: 4 } }}>
    {joinStats.map((stat) => (
      <KkStatRow.Item key={stat.label}>
        <KkStatRow.Value variant="h4" sx={{ color: 'primary.main' }}>
          {stat.value}
        </KkStatRow.Value>
        <KkStatRow.Label>{stat.label}</KkStatRow.Label>
      </KkStatRow.Item>
    ))}
  </KkStatRow>
);
