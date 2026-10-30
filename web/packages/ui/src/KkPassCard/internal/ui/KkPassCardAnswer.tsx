import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { useId } from 'react';
import type { KkAnswer } from '../../../internal/answer';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import type { KkTone } from '../../../internal/tone';
import { toneSelectedPaint } from '../../../internal/tone';
import { kkTokens } from '../../../tokens';
import { passFocus, passGoldEdge, passGoldInk, passRedInk } from '../pass-paint';

export type KkPassAnswer = Extract<KkAnswer, 'yes' | 'no'>;

const { light, dark } = kkTokens.color;
const PRESS_SCALE = 0.96;
const KEYS: readonly KkPassAnswer[] = ['yes', 'no'];

const keyTones: Record<KkPassAnswer, KkTone> = { yes: 'green', no: 'ink' };

const keyPaintOf =
  (tone: KkTone, owed: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: '1 1 0',
    minWidth: 0,
    minHeight: kkTokens.tapTarget,
    px: 1.5,
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: `${kkTokens.radius.pill}px`,
    color: 'text.primary',
    transition: `${kkTokens.motion.press}, background-color 160ms ease-out, border-color 160ms ease-out`,
    ...applyScheme(theme, schemeEdge(light.line, dark.line)),
    ...(owed ? passGoldEdge(theme) : {}),
    ...passFocus(theme),
    '&:active': { transform: `scale(${PRESS_SCALE})` },
    '&[aria-pressed="true"]': toneSelectedPaint(theme, tone),
    '&[aria-pressed="true"] > *': { color: 'text.primary' },
    '&.Mui-disabled': { opacity: 0.6 },
  });

const WORD_PAINT: CSSObject = {
  fontWeight: 800,
  lineHeight: 1.2,
  color: 'inherit',
  textAlign: 'center',
};

const notePaintOf =
  (alert: boolean) =>
  (theme: Theme): CSSObject => ({
    m: 0,
    fontWeight: 700,
    ...(alert ? passRedInk(theme) : passGoldInk(theme)),
  });

interface KkPassCardAnswerProps {
  label: string;
  value: KkAnswer | null;
  owed: boolean;
  labels: Record<KkPassAnswer, string>;
  onChange: (answer: KkPassAnswer) => void;
  note?: string;
  error?: string;
  disabled?: boolean;
}

export const KkPassCardAnswer: FC<KkPassCardAnswerProps> = ({
  label,
  value,
  owed,
  labels,
  onChange,
  note,
  error,
  disabled = false,
}) => {
  const noteId = useId();
  const message = error ?? note;
  const describedBy = message === undefined ? undefined : noteId;

  const pressOf: Record<KkPassAnswer, () => void> = {
    yes: () => {
      if (value !== 'yes') {
        onChange('yes');
      }
    },
    no: () => {
      if (value !== 'no') {
        onChange('no');
      }
    },
  };

  const keys = KEYS.map((answer) => (
    <ButtonBase
      key={answer}
      disableRipple
      aria-pressed={answer === value}
      disabled={disabled}
      onClick={pressOf[answer]}
      data-kk-pass-answer={answer}
      sx={keyPaintOf(keyTones[answer], owed)}
    >
      <Typography component="span" variant="body2" sx={WORD_PAINT}>
        {labels[answer]}
      </Typography>
    </ButtonBase>
  ));

  const messageLine =
    message === undefined ? null : (
      <Typography
        id={noteId}
        component="p"
        variant="caption"
        role={error === undefined ? undefined : 'alert'}
        sx={notePaintOf(error !== undefined)}
      >
        {message}
      </Typography>
    );

  return (
    <Stack sx={{ gap: 0.5, minWidth: 0 }}>
      <Stack
        direction="row"
        role="group"
        aria-label={label}
        aria-describedby={describedBy}
        sx={{ gap: 1, minWidth: 0, flexWrap: 'wrap' }}
      >
        {keys}
      </Stack>
      {messageLine}
    </Stack>
  );
};
