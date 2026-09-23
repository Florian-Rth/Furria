import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { buildHeroStats } from '@/features/landing/hero-content';
import { FOUNDING_YEAR, GROUP_COUNT_PLACEHOLDER, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';

const stats = buildHeroStats(MEMBER_COUNT_PLACEHOLDER, GROUP_COUNT_PLACEHOLDER, FOUNDING_YEAR);

export const HeroStatRow: FC = () => (
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
