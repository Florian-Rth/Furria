import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWash } from '../../../internal/ink-wash';
import { statusTick } from '../../../internal/status-paint';
import { KkNameLine } from '../../../KkNameLine';
import { kkTokens } from '../../../tokens';
import type { KkAnswerRollTone } from '../answer-roll-tone';
import { ANSWER_ROLL_LEVELS } from '../answer-roll-tone';

const TICK_SIZE = 1;
const NAMES_INDENT = 2;

interface KkAnswerRollGroupProps {
  tone: KkAnswerRollTone;
  label: string;
  count: number;
  names?: string;
  more?: string;
  onOpen?: () => void;
}

const openPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  width: '100%',
  minWidth: 0,
  margin: theme.spacing(0, -0.75),
  padding: theme.spacing(0.25, 0.75),
  boxSizing: 'content-box',
  textAlign: 'left',
  color: 'inherit',
  borderRadius: `${kkTokens.radius.bar * 2}px`,
  '@media (hover: hover)': { '&:hover': { backgroundColor: inkWash(theme, '7%') } },
  ...focusRing(theme),
});

export const KkAnswerRollGroup: FC<KkAnswerRollGroupProps> = ({
  tone,
  label,
  count,
  names,
  more,
  onOpen,
}) => {
  const level = ANSWER_ROLL_LEVELS[tone];
  const countWeight = count === 0 ? 600 : 800;
  const countInk = count === 0 ? 'text.secondary' : 'text.primary';
  const tickPaint = (theme: Theme): CSSObject => ({
    width: theme.spacing(TICK_SIZE),
    height: theme.spacing(TICK_SIZE),
    flexShrink: 0,
    borderRadius: '50%',
    ...statusTick(theme, level),
  });
  const nameLine =
    names === undefined ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{ display: 'block', minWidth: 0, pl: NAMES_INDENT, color: 'text.primary' }}
      >
        <KkNameLine names={names} more={more} />
      </Typography>
    );
  const content = (
    <>
      <Stack component="span" direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
        <Box component="span" aria-hidden sx={tickPaint} />
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
      {nameLine}
    </>
  );
  const body =
    onOpen === undefined ? (
      <Stack sx={{ minWidth: 0 }}>{content}</Stack>
    ) : (
      <ButtonBase onClick={onOpen} sx={openPaint}>
        {content}
      </ButtonBase>
    );

  return (
    <Box component="li" data-kk-answer-roll-group={tone} sx={{ minWidth: 0 }}>
      {body}
    </Box>
  );
};
