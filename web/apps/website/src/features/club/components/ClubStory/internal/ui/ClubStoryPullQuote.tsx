import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { storyPullQuote, storyPullQuoteSource } from '@/features/club/story-content';

export const ClubStoryPullQuote: FC = () => (
  <Stack component="figure" sx={{ gap: 1, m: 0 }}>
    <Typography variant="h1" component="blockquote" sx={{ color: 'text.primary', m: 0 }}>
      {storyPullQuote}
    </Typography>
    <Typography
      variant="caption"
      component="figcaption"
      sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}
    >
      {storyPullQuoteSource}
    </Typography>
  </Stack>
);
