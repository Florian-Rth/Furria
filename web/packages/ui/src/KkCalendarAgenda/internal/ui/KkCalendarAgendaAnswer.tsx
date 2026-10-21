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

const PRESS_SCALE = 0.95;
const OPEN_EDGE = 'color-mix(in srgb, currentColor 22%, transparent)';

const segmentPaint =
  (answer: KkAnswer, owed: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: '1 1 0',
    minWidth: 0,
    minHeight: kkTokens.tapTarget,
    gap: 0.625,
    px: 0.75,
    borderRadius: `${kkTokens.radius.pill}px`,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: owed ? (theme.vars ?? theme).palette.warning.main : OPEN_EDGE,
    color: 'text.primary',
    transition: kkTokens.motion.press,
    '&:active': { transform: `scale(${PRESS_SCALE})` },
    '&[aria-pressed="true"]': toneSelectedPaint(theme, answerTones[answer]),
    '&.Mui-disabled': { color: 'text.disabled' },
    ...focusRing(theme),
  });

interface KkCalendarAgendaAnswerProps {
  label: string;
  labels: Record<KkAnswer, string>;
  value: KkAnswer | null;
  onChange: (answer: KkAnswer) => void;
  disabled?: boolean;
  error?: string;
  sx?: KkSx;
}

export const KkCalendarAgendaAnswer: FC<KkCalendarAgendaAnswerProps> = ({
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
      aria-pressed={answer === value}
      disabled={disabled}
      onClick={pressOf[answer]}
      data-kk-calendar-answer={answer}
      sx={segmentPaint(answer, owed)}
    >
      <KkCalendarAgendaAnswerMark answer={answer} />
      <Typography component="span" variant="caption" noWrap sx={{ fontWeight: 800 }}>
        {labels[answer]}
      </Typography>
    </ButtonBase>
  ));
  const errorLine =
    error === undefined ? null : (
      <Typography
        component="p"
        role="alert"
        variant="caption"
        sx={(theme) => ({ fontWeight: 600, ...redInk(theme) })}
      >
        {error}
      </Typography>
    );

  return (
    <Stack sx={[{ gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        role="group"
        aria-label={label}
        data-kk-calendar-answer-row
        sx={{ gap: 0.75, minWidth: 0 }}
      >
        {segments}
      </Stack>
      {errorLine}
    </Stack>
  );
};
