import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { storyStats } from '@/features/club/story-content';

export const ClubStoryStats: FC = () => (
  <Stack
    direction="row"
    data-kk-story-stats
    sx={{
      gap: { xs: 3, md: 5 },
      flexWrap: 'wrap',
      borderTop: 1,
      borderColor: 'divider',
      pt: 3,
    }}
  >
    {storyStats.map((stat) => (
      <Stack key={stat.label} sx={{ gap: 0.5 }}>
        <Typography variant="h3" component="span" sx={{ lineHeight: 1 }}>
          {stat.value}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}
        >
          {stat.label}
        </Typography>
      </Stack>
    ))}
  </Stack>
);
