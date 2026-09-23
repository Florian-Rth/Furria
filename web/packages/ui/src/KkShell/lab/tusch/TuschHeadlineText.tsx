import type { CSSObject, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export type TuschHeadlineTone = 'print' | 'shadow';

const { shadowInk } = kkTokens.shell.material;
const SHADOW_BLUR = 'blur(5px)';

const tonePaint = (tone: TuschHeadlineTone, theme: Theme): CSSObject =>
  tone === 'print'
    ? { color: 'text.primary' }
    : {
        color: alpha(shadowInk.light, 0.3),
        filter: SHADOW_BLUR,
        ...theme.applyStyles('dark', { color: alpha(shadowInk.dark, 0.85) }),
      };

interface TuschHeadlineTextProps extends PropsWithChildren {
  tone: TuschHeadlineTone;
  nowrap?: boolean;
}

export const TuschHeadlineText: FC<TuschHeadlineTextProps> = ({
  tone,
  nowrap = false,
  children,
}) => (
  <Typography
    component="span"
    aria-hidden
    data-tusch-headline={tone}
    sx={(theme) => ({
      display: 'block',
      typography: 'h1',
      lineHeight: 1.1,
      letterSpacing: kkTokens.type.tracking.display,
      textTransform: 'uppercase',
      textWrap: nowrap ? 'nowrap' : 'balance',
      userSelect: 'none',
      ...tonePaint(tone, theme),
    })}
  >
    {children}
  </Typography>
);
