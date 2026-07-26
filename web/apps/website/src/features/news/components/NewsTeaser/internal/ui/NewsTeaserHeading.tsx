import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsHeading } from '@/features/news/news-content';

export const NewsTeaserHeading: FC = () => (
  <Stack
    direction="row"
    sx={{ alignItems: 'center', gap: { xs: 1.5, md: 2 }, flexGrow: 1, minWidth: 0 }}
  >
    <Box
      aria-hidden
      sx={{
        width: { xs: '0.875rem', md: '1.125rem' },
        height: { xs: '0.875rem', md: '1.125rem' },
        bgcolor: 'primary.main',
        flexShrink: 0,
      }}
    />
    <Typography variant="h2" component="h2" sx={{ flexShrink: 0 }}>
      {newsHeading}
    </Typography>
    <Box
      aria-hidden
      sx={{
        flexGrow: 1,
        borderBottom: 1,
        borderColor: 'divider',
        display: { xs: 'none', md: 'block' },
      }}
    />
  </Stack>
);
