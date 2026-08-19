import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from './tokens';

type KkEyebrowTone = 'accent' | 'muted' | 'onAccent';

interface KkEyebrowProps extends PropsWithChildren {
  tone?: KkEyebrowTone;
  sx?: SxProps<Theme>;
}

const toneStyles: Record<KkEyebrowTone, { color: string; opacity?: number }> = {
  accent: { color: 'primary.main' },
  muted: { color: 'text.secondary' },
  onAccent: { color: 'inherit', opacity: 0.85 },
};

export const KkEyebrow: FC<KkEyebrowProps> = ({ tone = 'accent', sx, children }) => (
  <Typography
    variant="overline"
    data-kk-eyebrow
    sx={[{ ...kkTokens.eyebrow, ...toneStyles[tone] }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Typography>
);
