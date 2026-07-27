import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

type KkCardTextTone = 'muted' | 'onAccent';

interface KkCardTextProps extends PropsWithChildren {
  clamp?: number;
  tone?: KkCardTextTone;
}

const toneStyles: Record<KkCardTextTone, { color: string; opacity?: number }> = {
  muted: { color: 'text.secondary' },
  onAccent: { color: 'inherit', opacity: 0.9 },
};

export const KkCardText: FC<KkCardTextProps> = ({ clamp, tone = 'muted', children }) => (
  <Typography
    variant="body2"
    data-kk-card-text
    sx={{
      ...toneStyles[tone],
      textWrap: 'pretty',
      ...(clamp === undefined
        ? {}
        : {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: clamp,
            overflow: 'hidden',
          }),
    }}
  >
    {children}
  </Typography>
);
