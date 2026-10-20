import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkAnswer } from '../../../internal/answer';
import { answerTones, KK_ANSWERS } from '../../../internal/answer';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { toneSelectedPaint } from '../../../internal/tone';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KkCalendarAgendaAnswerMark } from './KkCalendarAgendaAnswerMark';

const { tapTarget, line, motion } = kkTokens;
const PRESS_SCALE = 0.9;
const RING = '2.25rem';

const segmentPaint =
  (answer: KkAnswer, owed: boolean) =>
  (theme: Theme): CSSObject => ({
    width: tapTarget,
    height: tapTarget,
    borderRadius: '50%',
    color: 'text.primary',
    transition: motion.press,
    '&:active': { transform: `scale(${PRESS_SCALE})` },
    '& [data-kk-calendar-quick-ring]': {
      display: 'grid',
      placeItems: 'center',
      width: RING,
      height: RING,
      borderRadius: '50%',
      borderWidth: line.section,
      borderStyle: 'solid',
      borderColor: owed ? (theme.vars ?? theme).palette.warning.main : 'divider',
    },
    '&[aria-pressed="true"] [data-kk-calendar-quick-ring]': toneSelectedPaint(
      theme,
      answerTones[answer],
    ),
    '&.Mui-disabled': { color: 'text.disabled' },
    ...focusRing(theme),
  });

interface KkCalendarAgendaQuickProps {
  label: string;
  labels: Record<KkAnswer, string>;
  value: KkAnswer | null;
  onChange: (answer: KkAnswer) => void;
  disabled?: boolean;
  error?: string;
  sx?: KkSx;
}

export const KkCalendarAgendaQuick: FC<KkCalendarAgendaQuickProps> = ({
  label,
  labels,
  value,
  onChange,
  disabled = false,
  error,
  sx,
}) => {
  const owed = value === null;
  const pressOf: Record<KkAnswer, () => void> = {
    yes: () => onChange('yes'),
    maybe: () => onChange('maybe'),
    no: () => onChange('no'),
  };
  const segments = KK_ANSWERS.map((answer) => (
    <ButtonBase
      key={answer}
      disableRipple
      aria-label={labels[answer]}
      aria-pressed={answer === value}
      disabled={disabled}
      onClick={pressOf[answer]}
      data-kk-calendar-quick={answer}
      sx={segmentPaint(answer, owed)}
    >
      <Stack component="span" data-kk-calendar-quick-ring>
        <KkCalendarAgendaAnswerMark answer={answer} />
      </Stack>
    </ButtonBase>
  ));
  const errorLine =
    error === undefined ? null : (
      <Typography
        component="p"
        role="alert"
        variant="caption"
        sx={(theme) => ({ fontWeight: 600, textAlign: 'right', ...redInk(theme) })}
      >
        {error}
      </Typography>
    );

  return (
    <Stack sx={[{ alignItems: 'flex-end', minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack direction="row" role="group" aria-label={label} data-kk-calendar-quick-row>
        {segments}
      </Stack>
      {errorLine}
    </Stack>
  );
};
