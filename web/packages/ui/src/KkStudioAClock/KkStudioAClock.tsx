import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

interface KkStudioAClockProps {
  now: string;
  total: string;
  sx?: KkSx;
}

export const KkStudioAClock: FC<KkStudioAClockProps> = ({ now, total, sx }) => (
  <Typography
    component="span"
    variant="caption"
    data-kk-studio-a-clock
    sx={[
      {
        flexShrink: 0,
        fontFamily: kkTokens.font.mono,
        fontVariantNumeric: 'tabular-nums',
        fontWeight: 700,
        color: 'text.secondary',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography
      component="span"
      variant="caption"
      sx={{ fontFamily: 'inherit', fontWeight: 'inherit', color: 'text.primary' }}
    >
      {now}
    </Typography>
    {` / ${total}`}
  </Typography>
);
