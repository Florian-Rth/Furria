import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkConfettiBurst } from '../../../KkConfettiBurst';
import { stampDownOf } from '../../../stamp-down';
import { useBeatReached } from '../logic/use-beat-reached';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { plateLiftOf } from '../welcome-paint';

const BURST_COUNT = 44;
const BURST_SEED = 71;

interface KkWelcomeStageCallProps {
  lead: string;
  answer: string;
  at: number;
  answerAt: number;
}

export const KkWelcomeStageCall: FC<KkWelcomeStageCallProps> = ({ lead, answer, at, answerAt }) => {
  const { leaving } = useWelcomeRun();
  const answered = useBeatReached(answerAt);
  const fireKey = answered ? 1 : 0;

  return (
    <Stack sx={{ position: 'relative', ...plateLiftOf('red', leaving) }}>
      <Typography component="p" variant="poster">
        <Box component="span" sx={{ ...stampDownOf(at), color: 'text.primary' }}>
          {lead}
        </Box>
        <Box component="span" sx={{ ...stampDownOf(answerAt), color: 'primary.main' }}>
          {answer}
        </Box>
      </Typography>
      <KkConfettiBurst fireKey={fireKey} count={BURST_COUNT} seed={BURST_SEED} />
    </Stack>
  );
};
