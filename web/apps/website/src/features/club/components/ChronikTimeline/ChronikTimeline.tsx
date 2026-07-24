import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { chronikChapter, MILESTONES, resolveMilestoneTint } from '@/features/club/chronik-content';
import { ChapterHeader } from '../ChapterHeader/ChapterHeader';
import { ChronikSpine } from './internal/layout/ChronikSpine';
import { ChronikMilestone } from './internal/ui/ChronikMilestone';

export const ChronikTimeline: FC = () => {
  const theme = useTheme();

  return (
    <Stack component="section" data-kk-chronik sx={{ gap: { xs: 4, md: 6 } }}>
      <ChapterHeader
        numeral={chronikChapter.numeral}
        kicker={chronikChapter.kicker}
        title={chronikChapter.title}
      />
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
    </Stack>
  );
};
