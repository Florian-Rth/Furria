import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { toneSelectedPaint } from '../../../internal/tone';
import { kkTokens } from '../../../tokens';

export type KkAgendaAnswerValue = 'yes' | 'no';

const FACE_HEIGHT = '2.25rem';
const PRESS_SCALE = 0.94;
const FACE = '[data-kk-agenda-answer-face]';

const segmentPaint =
  (value: KkAgendaAnswerValue, owed: boolean) =>
  (theme: Theme): CSSObject => ({
    minHeight: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    color: 'text.primary',
    ...focusRing(theme),
    [`& ${FACE}`]: {
      minHeight: FACE_HEIGHT,
      px: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: owed ? kkTokens.line.section : kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: owed ? (theme.vars ?? theme).palette.warning.main : 'divider',
      borderRadius: `${kkTokens.radius.pill}px`,
      transition: kkTokens.motion.press,
    },
    [`&:active ${FACE}`]: { transform: `scale(${PRESS_SCALE})` },
    [`&[aria-pressed="true"] ${FACE}`]: toneSelectedPaint(
      theme,
      value === 'yes' ? 'green' : 'neutral',
    ),
    '&.Mui-disabled': { color: 'text.disabled' },
  });

const errorPaint = (theme: Theme): CSSObject => ({ fontWeight: 600, ...redInk(theme) });

interface KkAgendaAnswerProps {
  label: string;
  yesLabel: string;
  noLabel: string;
  value: KkAgendaAnswerValue | 'maybe' | null;
  onChange: (answer: KkAgendaAnswerValue) => void;
  disabled?: boolean;
  error?: string;
}

export const KkAgendaAnswer: FC<KkAgendaAnswerProps> = ({
  label,
  yesLabel,
  noLabel,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const owed = value === null;
  const sayYes = (): void => {
    onChange('yes');
  };
  const sayNo = (): void => {
    onChange('no');
  };
  const errorLine =
    error === undefined ? null : (
      <Typography component="p" role="alert" variant="caption" sx={errorPaint}>
        {error}
      </Typography>
    );

  return (
    <Stack sx={{ flexShrink: 0, alignItems: 'flex-end', ml: 'auto' }}>
      <Stack direction="row" role="group" aria-label={label} sx={{ gap: 0.25 }}>
        <ButtonBase
          disableRipple
          aria-pressed={value === 'yes'}
          disabled={disabled}
          onClick={sayYes}
          data-kk-agenda-answer="yes"
          sx={segmentPaint('yes', owed)}
        >
          <Stack component="span" data-kk-agenda-answer-face>
            <Typography component="span" variant="caption" noWrap sx={{ fontWeight: 800 }}>
              {yesLabel}
            </Typography>
          </Stack>
        </ButtonBase>
        <ButtonBase
          disableRipple
          aria-pressed={value === 'no'}
          disabled={disabled}
          onClick={sayNo}
          data-kk-agenda-answer="no"
          sx={segmentPaint('no', owed)}
        >
          <Stack component="span" data-kk-agenda-answer-face>
            <Typography component="span" variant="caption" noWrap sx={{ fontWeight: 800 }}>
              {noLabel}
            </Typography>
          </Stack>
        </ButtonBase>
      </Stack>
      {errorLine}
    </Stack>
  );
};
