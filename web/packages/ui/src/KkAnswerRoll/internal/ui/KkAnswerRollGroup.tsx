import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import { statusTick } from '../../../internal/status-paint';
import type { KkAnswerRollTone } from '../answer-roll-tone';
import { ANSWER_ROLL_LEVELS } from '../answer-roll-tone';

const TICK_SIZE = 1;
const NAMES_INDENT = 2;

interface KkAnswerRollGroupProps {
  tone: KkAnswerRollTone;
  label: string;
  count: number;
  names?: string;
}

export const KkAnswerRollGroup: FC<KkAnswerRollGroupProps> = ({ tone, label, count, names }) => {
  const namesId = useId();
  const level = ANSWER_ROLL_LEVELS[tone];
  const countWeight = count === 0 ? 600 : 800;
  const countInk = count === 0 ? 'text.secondary' : 'text.primary';
  const describedBy = names === undefined ? undefined : namesId;
  const namesLine =
    names === undefined ? null : (
      <Typography
        id={namesId}
        variant="caption"
        sx={{
          display: 'block',
          color: 'text.secondary',
          pl: NAMES_INDENT,
          overflowWrap: 'anywhere',
        }}
      >
        {names}
      </Typography>
    );

  return (
    <Stack data-kk-answer-roll-group={tone} aria-describedby={describedBy} sx={{ minWidth: 0 }}>
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
        <Typography variant="body2" sx={{ flexGrow: 1, minWidth: 0, fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: countWeight, color: countInk, fontVariantNumeric: 'tabular-nums' }}
        >
          {count}
        </Typography>
      </Stack>
      {namesLine}
    </Stack>
  );
};
