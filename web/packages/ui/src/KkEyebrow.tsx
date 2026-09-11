import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

type KkEyebrowTone = 'accent' | 'muted' | 'onAccent';
type KkEyebrowSize = 'small' | 'medium';

interface KkEyebrowProps extends PropsWithChildren {
  tone?: KkEyebrowTone;
  size?: KkEyebrowSize;
  sx?: SxProps<Theme>;
}

const toneStyles: Record<KkEyebrowTone, { color: string; opacity?: number }> = {
  accent: { color: 'primary.main' },
  muted: { color: 'text.secondary' },
  onAccent: { color: 'inherit', opacity: 0.85 },
};

const sizeStyles: Record<KkEyebrowSize, { fontSize?: string }> = {
  medium: {},
  small: { fontSize: kkTokens.type.eyebrowSmall },
};

export const KkEyebrow: FC<KkEyebrowProps> = ({
  tone = 'accent',
  size = 'medium',
  sx,
  children,
}) => (
  <Typography
    variant="overline"
    data-kk-eyebrow
    sx={[
      { ...kkTokens.eyebrow, ...toneStyles[tone], ...sizeStyles[size] },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
