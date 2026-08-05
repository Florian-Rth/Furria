import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { matcherLabels, matcherMailHref } from '@/features/group-matcher/matcher-content';

interface MatcherErrorProps {
  onRetry: () => void;
}

export const MatcherError: FC<MatcherErrorProps> = ({ onRetry }) => (
  <Stack role="alert" sx={{ gap: 2 }}>
    <Typography variant="h5" component="p">
      {matcherLabels.errorTitle}
    </Typography>
    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
      {matcherLabels.errorText}
    </Typography>
    <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap', pt: 1 }}>
      <Button variant="contained" color="primary" onClick={onRetry}>
        {matcherLabels.errorRetry}
      </Button>
      <Button variant="outlined" href={matcherMailHref}>
        {matcherLabels.errorMail}
      </Button>
    </Stack>
  </Stack>
);
