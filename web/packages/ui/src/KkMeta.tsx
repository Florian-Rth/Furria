import Typography from '@mui/material/Typography';
import type { ElementType, FC, PropsWithChildren } from 'react';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkMetaTone = 'muted' | 'faint' | 'accent';

const toneColors: Record<KkMetaTone, string> = {
  muted: 'text.secondary',
  faint: 'text.disabled',
  accent: 'primary.main',
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
      {
        color: toneColors[tone],
        fontFamily: kkTokens.font.body,
        fontSize: kkTokens.type.rowMeta,
        fontWeight: 600,
        fontStyle: italic ? 'italic' : 'normal',
        letterSpacing: '0.01em',
        lineHeight: 1.35,
        minWidth: 0,
        textWrap: 'pretty',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
