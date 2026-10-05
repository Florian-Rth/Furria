import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

const ONE_LINE = 1;

export const ConfettiHeadline: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    component="span"
    sx={{
      typography: 'h1',
      lineHeight: 1.1,
      letterSpacing: kkTokens.type.tracking.display,
      color: 'text.primary',
      textTransform: 'uppercase',
      ...lineClamp(ONE_LINE),
    }}
  >
    {children}
  </Typography>
);
