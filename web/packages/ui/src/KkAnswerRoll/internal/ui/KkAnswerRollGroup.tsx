import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { statusTick } from '../../../internal/status-paint';
import type { KkAnswerRollName } from '../answer-roll-name';
import type { KkAnswerRollTone } from '../answer-roll-tone';
import { ANSWER_ROLL_LEVELS } from '../answer-roll-tone';
import { KkAnswerRollNames } from './KkAnswerRollNames';

const TICK_SIZE = 1;
const NO_NAMES: readonly KkAnswerRollName[] = [];

interface KkAnswerRollGroupProps {
  tone: KkAnswerRollTone;
  label: string;
  count: number;
  names?: readonly KkAnswerRollName[];
}

export const KkAnswerRollGroup: FC<KkAnswerRollGroupProps> = ({
  tone,
  label,
  count,
  names = NO_NAMES,
}) => {
  const level = ANSWER_ROLL_LEVELS[tone];
  const countWeight = count === 0 ? 600 : 800;
  const countInk = count === 0 ? 'text.secondary' : 'text.primary';
  const namesList = names.length === 0 ? null : <KkAnswerRollNames names={names} />;

  return (
    <Stack component="li" data-kk-answer-roll-group={tone} sx={{ minWidth: 0 }}>
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box
          aria-hidden
          sx={(theme) => ({
            width: theme.spacing(TICK_SIZE),
            height: theme.spacing(TICK_SIZE),
            flexShrink: 0,
            borderRadius: '50%',
            ...statusTick(theme, level),
          })}
        />
        <Typography
          component="span"
          variant="body2"
          sx={{ flexGrow: 1, minWidth: 0, fontWeight: 700 }}
        >
          {label}
        </Typography>
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: countWeight, color: countInk, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
        </Typography>
      </Stack>
      {namesList}
    </Stack>
  );
};
