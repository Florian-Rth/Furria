import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildHeroStats } from '@/features/landing/hero-content';
import { FOUNDING_YEAR, GROUP_COUNT_PLACEHOLDER, MEMBER_COUNT_PLACEHOLDER } from '@/lib/club';

const stats = buildHeroStats(MEMBER_COUNT_PLACEHOLDER, GROUP_COUNT_PLACEHOLDER, FOUNDING_YEAR);

export const HeroStatRow: FC = () => (
  <Stack
    direction="row"
    sx={{
      gap: 4,
      flexWrap: 'wrap',
      borderTop: 1,
      borderColor: 'divider',
      pt: 3,
    }}
  >
    {stats.map((stat) => (
      <Stack key={stat.label} sx={{ gap: 0.5 }}>
        <Typography variant="h4" component="span" sx={{ color: 'primary.main', lineHeight: 1 }}>
          {stat.value}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {stat.label}
        </Typography>
      </Stack>
    ))}
  </Stack>
);
