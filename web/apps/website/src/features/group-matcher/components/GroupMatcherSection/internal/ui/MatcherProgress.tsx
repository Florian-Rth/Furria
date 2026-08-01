import { kkTokens } from '@furria/ui';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface MatcherProgressProps {
  label: string;
  percent: number;
}

export const MatcherProgress: FC<MatcherProgressProps> = ({ label, percent }) => (
  <Stack sx={{ gap: 1 }}>
    <Typography
      variant="caption"
      sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
    >
      {label}
    </Typography>
    <LinearProgress
      variant="determinate"
      value={percent}
      aria-label={label}
      sx={{ height: '0.5rem', borderRadius: `${kkTokens.radius.pill}px` }}
    />
  </Stack>
);
