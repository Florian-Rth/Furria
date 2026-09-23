import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { storyPullQuote } from '@/features/club/story-content';

export const ClubStoryPullQuote: FC = () => (
  <Typography variant="h2" component="p" sx={{ color: 'text.primary' }}>
    {storyPullQuote}
  </Typography>
);
