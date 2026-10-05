import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { kkTokens } from '../../../tokens';
import { showsElevenStar } from '../logic/number-star';

const ELEVEN_STAR = '✶';
const NO_STAR = '';

const numberPaintOf =
  (festive: boolean) =>
  (theme: Theme): CSSObject => ({
    lineHeight: 1,
    letterSpacing: kkTokens.type.tracking.display,
    whiteSpace: 'nowrap',
    ...(festive
      ? applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk))
      : { color: 'text.primary' }),
  });

interface KkDensePanelNumberProps {
  value: number;
  festive?: boolean;
}

export const KkDensePanelNumber: FC<KkDensePanelNumberProps> = ({ value, festive = false }) => {
  const star = showsElevenStar(value) ? ELEVEN_STAR : NO_STAR;

  return (
    <Typography component="span" variant="h3" data-kk-dense-number sx={numberPaintOf(festive)}>
      {value}
      {star}
    </Typography>
  );
};
