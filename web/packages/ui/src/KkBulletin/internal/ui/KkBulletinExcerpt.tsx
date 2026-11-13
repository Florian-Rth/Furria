import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import type { KkSx } from '../../../kk-sx';

interface KkBulletinExcerptProps extends PropsWithChildren {
  lines?: number;
  sx?: KkSx;
}

const DEFAULT_LINES = 2;

export const KkBulletinExcerpt: FC<KkBulletinExcerptProps> = ({
  lines = DEFAULT_LINES,
  sx,
  children,
}) => (
  <Typography
    variant="body2"
    sx={[
      { color: 'text.secondary', overflowWrap: 'anywhere', ...lineClamp(lines) },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Typography>
);
