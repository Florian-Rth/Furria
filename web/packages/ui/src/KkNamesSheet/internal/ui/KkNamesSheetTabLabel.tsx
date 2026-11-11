import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { statusTick } from '../../../internal/status-paint';
import type { KkAnswerRollTone } from '../../../KkAnswerRoll/internal/answer-roll-tone';
import { ANSWER_ROLL_LEVELS } from '../../../KkAnswerRoll/internal/answer-roll-tone';

const TICK_SIZE = 1;

interface KkNamesSheetTabLabelProps {
  label: string;
  count: number;
  tone?: KkAnswerRollTone;
}

export const KkNamesSheetTabLabel: FC<KkNamesSheetTabLabelProps> = ({ label, count, tone }) => {
  const tickPaint = (theme: Theme): CSSObject => ({
    width: theme.spacing(TICK_SIZE),
    height: theme.spacing(TICK_SIZE),
    flexShrink: 0,
    borderRadius: '50%',
    ...(tone === undefined ? {} : statusTick(theme, ANSWER_ROLL_LEVELS[tone])),
  });
  const tick = tone === undefined ? null : <Box aria-hidden sx={tickPaint} />;

  return (
    <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
      {tick}
      <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'inherit' }}>
        {label}
      </Typography>
      <Typography
        component="span"
        variant="body2"
        sx={{ fontWeight: 800, color: 'inherit', fontVariantNumeric: 'tabular-nums' }}
      >
        {count}
      </Typography>
    </Stack>
  );
};
