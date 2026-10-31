import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkConfettiBurst } from '../../../KkConfettiBurst';
import { useBeatReached } from '../logic/use-beat-reached';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { plateLiftOf, REDUCED_MOTION } from '../welcome-paint';

const STAMP_MS = 420;
const BURST_COUNT = 44;
const BURST_SEED = 71;

const stampDown = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.7) rotate(-4deg);
  }
  55% {
    opacity: 1;
    transform: scale(0.95) rotate(0deg);
  }
  78% {
    transform: scale(1.02);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const stampOf = (atMs: number): CSSObject => ({
  display: 'block',
  transformOrigin: 'left center',
  animation: `${stampDown} ${STAMP_MS}ms cubic-bezier(0.2, 0.8, 0.2, 1) ${atMs}ms both`,
  [REDUCED_MOTION]: { animation: 'none' },
});

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
        <Box component="span" sx={{ ...stampOf(at), color: 'text.primary' }}>
          {lead}
        </Box>
        <Box component="span" sx={{ ...stampOf(answerAt), color: 'primary.main' }}>
          {answer}
        </Box>
      </Typography>
      <KkConfettiBurst fireKey={fireKey} count={BURST_COUNT} seed={BURST_SEED} />
    </Stack>
  );
};
