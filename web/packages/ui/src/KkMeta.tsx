import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import { redInk } from './internal/red-ink';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkMetaTone = 'muted' | 'faint' | 'accent';

const tonePaint: Record<KkMetaTone, (theme: Theme) => CSSObject> = {
  muted: () => ({ color: 'text.secondary' }),
  faint: () => ({ color: 'text.disabled' }),
  accent: (theme) => redInk(theme),
};

interface KkMetaProps extends PropsWithChildren {
  tone?: KkMetaTone;
  italic?: boolean;
  component?: ElementType;
  sx?: KkSx;
}

export const KkMeta: FC<KkMetaProps> = ({
  tone = 'muted',
  italic = false,
  component = 'p',
  sx,
  children,
}) => (
  <Typography
    component={component}
    data-kk-meta
    sx={[
      (theme) => ({
        ...tonePaint[tone](theme),
        ...theme.typography.caption,
        fontWeight: 600,
        fontStyle: italic ? 'italic' : 'normal',
        letterSpacing: kkTokens.type.tracking.tight,
        lineHeight: 1.35,
        minWidth: 0,
        textWrap: 'pretty',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
