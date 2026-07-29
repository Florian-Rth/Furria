import { kkTokens } from '@furria/ui';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import {
  buildMatchPercentageLabel,
  buildPercentageText,
  kompassResultLabels,
} from '@/features/group-matcher/kompass-content';

interface KompassMatchBarProps {
  percentage: number;
  groupName: string;
}

export const KompassMatchBar: FC<KompassMatchBarProps> = ({ percentage, groupName }) => {
  const label = buildMatchPercentageLabel(percentage, groupName);
  const text = buildPercentageText(percentage);

  return (
    <Stack sx={{ gap: 0.75 }}>
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, letterSpacing: '0.08em', color: 'text.secondary' }}
        >
          {kompassResultLabels.matchCaption}
        </Typography>
        <Typography variant="h6" component="span">
          {text}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={percentage}
        aria-label={label}
        sx={{ height: '0.5rem', borderRadius: `${kkTokens.radius.pill}px` }}
      />
    </Stack>
  );
};
