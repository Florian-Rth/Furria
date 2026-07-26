import { KkSection } from '@furria/ui';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { chronikChapter, MILESTONES, resolveMilestoneTint } from '@/features/club/chronik-content';
import { ChronikSpine } from './internal/layout/ChronikSpine';
import { ChronikMilestone } from './internal/ui/ChronikMilestone';

export const ChronikTimeline: FC = () => {
  const theme = useTheme();

  return (
    <KkSection>
      <KkSection.Header {...chronikChapter} />
      <ChronikSpine>
        {MILESTONES.map((milestone, index) => (
          <ChronikMilestone
            key={milestone.year}
            milestone={milestone}
            tint={resolveMilestoneTint(theme, index)}
            accented={index === 0}
          />
        ))}
      </ChronikSpine>
    </KkSection>
  );
};
