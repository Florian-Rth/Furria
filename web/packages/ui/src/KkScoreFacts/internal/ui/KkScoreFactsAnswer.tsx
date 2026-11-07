import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkScoreAnswer = 'yes' | 'no';

const keyPaint = (theme: Theme): CSSObject => ({
  minHeight: kkTokens.tapTarget,
  px: 1.25,
  typography: 'caption',
  fontWeight: 800,
  color: 'text.primary',
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  whiteSpace: 'nowrap',
  ...focusRing(theme),
  '&:first-of-type': { borderRadius: `${kkTokens.radius.chip}px 0 0 ${kkTokens.radius.chip}px` },
  '&:last-of-type': {
    borderRadius: `0 ${kkTokens.radius.chip}px ${kkTokens.radius.chip}px 0`,
    ml: '-1px',
  },
  '&[aria-pressed="true"]': {
    bgcolor: 'text.primary',
    color: 'background.paper',
    borderColor: 'text.primary',
  },
});

interface KkScoreFactsAnswerProps {
  label: string;
  value: KkScoreAnswer | null;
  yesLabel: string;
  noLabel: string;
  busy: boolean;
  owed: boolean;
  onAnswer: (answer: KkScoreAnswer) => void;
}

export const KkScoreFactsAnswer: FC<KkScoreFactsAnswerProps> = ({
  label,
  value,
  yesLabel,
  noLabel,
  busy,
  owed,
  onAnswer,
}) => {
  const yes = (): void => {
    onAnswer('yes');
  };
  const no = (): void => {
    onAnswer('no');
  };

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      aria-busy={busy}
      data-owed={owed}
      sx={(theme) => ({
        flexShrink: 0,
        '&[data-owed="true"] > button': { borderColor: 'currentColor', ...goldInkOf(theme) },
      })}
    >
      <ButtonBase aria-pressed={value === 'yes'} disabled={busy} onClick={yes} sx={keyPaint}>
        {yesLabel}
      </ButtonBase>
      <ButtonBase aria-pressed={value === 'no'} disabled={busy} onClick={no} sx={keyPaint}>
        {noLabel}
      </ButtonBase>
    </Stack>
  );
};
