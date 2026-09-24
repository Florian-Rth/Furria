import type { CSSObject, SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { redInk } from './internal/red-ink';
import { kkTokens } from './tokens';

type KkEyebrowTone = 'accent' | 'muted' | 'onAccent';

interface KkEyebrowProps extends PropsWithChildren {
  tone?: KkEyebrowTone;
  sx?: SxProps<Theme>;
}

const toneStyles: Record<KkEyebrowTone, (theme: Theme) => CSSObject> = {
  accent: (theme) => redInk(theme),
  muted: () => ({ color: 'text.secondary' }),
  onAccent: () => ({ color: 'inherit', opacity: 0.85 }),
};

export const KkEyebrow: FC<KkEyebrowProps> = ({ tone = 'accent', sx, children }) => (
  <Typography
    variant="overline"
    data-kk-eyebrow
    sx={[
      (theme) => ({ ...kkTokens.eyebrow, ...toneStyles[tone](theme) }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
