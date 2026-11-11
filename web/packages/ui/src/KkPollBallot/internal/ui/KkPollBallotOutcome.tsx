import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkPollBallotOutcomeProps {
  text: string;
  sx?: KkSx;
}

export const KkPollBallotOutcome: FC<KkPollBallotOutcomeProps> = ({ text, sx }) => (
  <Typography
    component="p"
    variant="body2"
    data-kk-poll-ballot-outcome
    sx={[{ fontWeight: 800, m: 0, overflowWrap: 'anywhere' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {text}
  </Typography>
);
