import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherResultLabels } from '@/features/group-matcher/matcher-content';

interface MatcherResultUnansweredProps {
  summary: string;
}

export const MatcherResultUnanswered: FC<MatcherResultUnansweredProps> = ({ summary }) => (
  <Stack sx={{ gap: 1.5 }}>
    <Typography variant="h3" component="p">
      {matcherResultLabels.unansweredTitle}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {summary}
    </Typography>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {matcherResultLabels.unansweredText}
    </Typography>
  </Stack>
);
