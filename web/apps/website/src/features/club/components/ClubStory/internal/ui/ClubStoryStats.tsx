import { KkStatRow } from '@furria/ui';
import type { FC } from 'react';
import { storyStats } from '@/features/club/story-content';

export const ClubStoryStats: FC = () => (
  <KkStatRow>
    {storyStats.map((stat) => (
      <KkStatRow.Item key={stat.label}>
        <KkStatRow.Value variant="h3">{stat.value}</KkStatRow.Value>
        <KkStatRow.Label sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
          {stat.label}
        </KkStatRow.Label>
      </KkStatRow.Item>
    ))}
  </KkStatRow>
);
