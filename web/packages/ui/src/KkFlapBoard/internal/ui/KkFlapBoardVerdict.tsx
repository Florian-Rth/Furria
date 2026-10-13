import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { BOARD_INK } from '../../../internal/status-paint';
import { KkFlapCount } from '../../../KkFlapCount';
import { kkTokens } from '../../../tokens';
import { BOARD_STAGGER_SECONDS, boardLabel } from '../board-paint';

interface KkFlapBoardVerdictProps {
  label: string;
  word: string;
  level: KkStatusLevel;
  after: number;
}

export const KkFlapBoardVerdict: FC<KkFlapBoardVerdictProps> = ({ label, word, level, after }) => {
  const delay = (after + 1) * BOARD_STAGGER_SECONDS + kkTokens.system.verdictPauseSeconds;

  return (
    <Stack
      role="status"
      data-kk-flap-board-verdict={level}
      sx={{ rowGap: 0.25, minWidth: 0 }}
    >
      <Typography component="span" sx={boardLabel}>
        {label}
      </Typography>
      <KkFlapCount
        value={word}
        variant="h1"
        delaySeconds={delay}
        sx={{ color: BOARD_INK[level], lineHeight: 1 }}
      />
    </Stack>
  );
};
