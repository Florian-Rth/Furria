import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkAnswer } from './internal/answer';
import { answerTones, KK_ANSWERS } from './internal/answer';
import { redInk } from './internal/red-ink';
import type { KkTone } from './internal/tone';
import { toneSelectedPaint } from './internal/tone';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type { KkAnswer } from './internal/answer';

export type KkAnswerChoiceLabels = Record<KkAnswer, string>;

const CHOICE_CONTAINER = 'kk-answer-choice';
const STACKED = `@container ${CHOICE_CONTAINER} (max-width: 14rem)`;
const FACE_HEIGHT = '2.25rem';
const FACE = '[data-kk-answer-face]';
const PRESS_SCALE = 0.96;
const FACE_RING_OFFSET = 2;

const CHOICE_FRAME: CSSObject = {
  width: '100%',
  minWidth: 0,
  containerType: 'inline-size',
  containerName: CHOICE_CONTAINER,
};

const SEGMENTS_FRAME: CSSObject = {
  gap: 0.75,
  minWidth: 0,
  [STACKED]: {
    flexDirection: 'column',
    gap: 0,
    '& > [data-kk-answer]': { flexBasis: 'auto' },
  },
};

const faceRing = (theme: Theme): CSSObject => ({
  outline: `${kkTokens.line.section}px solid`,
  outlineColor: (theme.vars ?? theme).palette.primary.main,
  outlineOffset: FACE_RING_OFFSET,
});

const segmentPaintOf =
  (tone: KkTone) =>
  (theme: Theme): CSSObject => ({
    flex: '1 1 0',
    minWidth: 0,
    minHeight: kkTokens.tapTarget,
    color: 'text.primary',
    [`& ${FACE}`]: {
      width: '100%',
      minHeight: FACE_HEIGHT,
      px: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: kkTokens.line.hair,
      borderStyle: 'solid',
      borderColor: 'divider',
      borderRadius: `${kkTokens.radius.pill}px`,
      transition: kkTokens.motion.press,
    },
    [`&:active ${FACE}`]: { transform: `scale(${PRESS_SCALE})` },
    [`&[aria-pressed="true"] ${FACE}`]: toneSelectedPaint(theme, tone),
    '&.Mui-focusVisible': { outline: 'none' },
    [`&.Mui-focusVisible ${FACE}`]: faceRing(theme),
    '&.Mui-disabled': { color: 'text.disabled' },
  });

const WORD_PAINT: CSSObject = {
  fontWeight: 800,
  letterSpacing: kkTokens.type.tracking.tight,
  lineHeight: 1.2,
  color: 'inherit',
};

const errorPaint = (theme: Theme): CSSObject => ({
  mt: 0.75,
  fontWeight: 600,
  ...redInk(theme),
});

interface KkAnswerChoiceProps {
  label: string;
  value: KkAnswer | null;
  onChange: (answer: KkAnswer) => void;
  labels: KkAnswerChoiceLabels;
  disabled?: boolean;
  error?: string;
  id?: string;
  sx?: KkSx;
}

export const KkAnswerChoice: FC<KkAnswerChoiceProps> = ({
  label,
  value,
  onChange,
  labels,
  disabled = false,
  error,
  id,
  sx,
}) => {
  const errorId = useId();
  const describedBy = error === undefined ? undefined : errorId;

  const press = (answer: KkAnswer): void => {
    if (answer === value) {
      return;
    }

    onChange(answer);
  };

  const pressOf: Record<KkAnswer, () => void> = {
    yes: () => press('yes'),
    maybe: () => press('maybe'),
    no: () => press('no'),
  };

  const segments = KK_ANSWERS.map((answer) => {
    const pressed = answer === value;

    return (
      <ButtonBase
        key={answer}
        disableRipple
        aria-pressed={pressed}
        disabled={disabled}
        onClick={pressOf[answer]}
        data-kk-answer={answer}
        sx={segmentPaintOf(answerTones[answer])}
      >
        <Stack component="span" direction="row" data-kk-answer-face>
          <Typography component="span" variant="caption" noWrap sx={WORD_PAINT}>
            {labels[answer]}
          </Typography>
        </Stack>
      </ButtonBase>
    );
  });

  const errorLine =
    error === undefined ? null : (
      <Typography id={errorId} component="p" variant="caption" role="alert" sx={errorPaint}>
        {error}
      </Typography>
    );

  return (
    <Stack id={id} data-kk-answer-choice sx={[CHOICE_FRAME, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        role="group"
        aria-label={label}
        aria-describedby={describedBy}
        sx={SEGMENTS_FRAME}
      >
        {segments}
      </Stack>
      {errorLine}
    </Stack>
  );
};
