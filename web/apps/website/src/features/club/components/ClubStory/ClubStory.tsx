import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { storyChapter } from '@/features/club/story-content';
import { ChapterHeader } from '../ChapterHeader/ChapterHeader';
import { ClubStoryLayout } from './internal/layout/ClubStoryLayout';
import { ClubStoryBody } from './internal/ui/ClubStoryBody';
import { ClubStoryPhoto } from './internal/ui/ClubStoryPhoto';
import { ClubStoryPullQuote } from './internal/ui/ClubStoryPullQuote';
import { ClubStoryStats } from './internal/ui/ClubStoryStats';

export const ClubStory: FC = () => (
  <Stack component="section" data-kk-club-story sx={{ gap: { xs: 4, md: 6 } }}>
    <ChapterHeader
      numeral={storyChapter.numeral}
      kicker={storyChapter.kicker}
      title={storyChapter.title}
    />
    <ClubStoryLayout>
      <Grid size={{ xs: 12, md: 6 }}>
        <ClubStoryPhoto />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Stack sx={{ gap: 3 }}>
          <ClubStoryPullQuote />
          <ClubStoryBody />
        </Stack>
      </Grid>
    </ClubStoryLayout>
    <ClubStoryStats />
  </Stack>
);
