import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, ReactNode } from 'react';
import type { KkAnswer } from '../../../internal/answer';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { KkIcon } from '../../../KkIcon';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';
import { kkTokens } from '../../../tokens';

const MARK_SIZE = '1.25rem';
const MAYBE_GLYPH = '?';

const { light, dark } = kkTokens.color;

const markInks: Record<KkAnswer, (theme: Theme) => CSSObject> = {
  yes: (theme) => applyScheme(theme, schemeInk(light.greenInk, dark.greenInk)),
  maybe: (theme) => applyScheme(theme, schemeInk(light.goldInk, dark.goldInk)),
  no: () => ({ color: 'text.disabled' }),
};

const markPaintOf =
  (answer: KkAnswer) =>
  (theme: Theme): CSSObject => ({
    width: MARK_SIZE,
    height: MARK_SIZE,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...markInks[answer](theme),
  });

const MAYBE_PAINT: CSSObject = { lineHeight: 1, color: 'inherit' };

const glyphs: Record<KkAnswer, ReactNode> = {
  yes: <KkIcon name="check" size="small" />,
  maybe: (
    <Typography component="span" variant="h4" sx={MAYBE_PAINT}>
      {MAYBE_GLYPH}
    </Typography>
  ),
  no: <KkIcon name="close" size="small" />,
};

interface KkDensePanelAnswerMarkProps {
  answer: KkAnswer;
  label: string;
}

export const KkDensePanelAnswerMark: FC<KkDensePanelAnswerMarkProps> = ({ answer, label }) => (
  <Stack component="span" data-kk-answer-mark={answer} sx={markPaintOf(answer)}>
    <Stack component="span" aria-hidden>
      {glyphs[answer]}
    </Stack>
    <KkVisuallyHidden>{label}</KkVisuallyHidden>
  </Stack>
);
