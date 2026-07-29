import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kompassResultLabels } from '@/features/group-matcher/kompass-content';

interface KompassResultUnansweredProps {
  summary: string;
}

export const KompassResultUnanswered: FC<KompassResultUnansweredProps> = ({ summary }) => (
  <Stack sx={{ gap: 1.5 }}>
    <Typography variant="h3" component="p">
      {kompassResultLabels.unansweredTitle}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {summary}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {kompassResultLabels.unansweredText}
    </Typography>
  </Stack>
);
