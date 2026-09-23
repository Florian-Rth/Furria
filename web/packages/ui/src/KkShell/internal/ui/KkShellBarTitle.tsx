import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

export const KkShellBarTitle: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    component="span"
    data-kk-shell-bar-title
    sx={{
      typography: 'h4',
      letterSpacing: kkTokens.type.tracking.display,
      lineHeight: 1.2,
      color: 'text.primary',
      ...lineClamp(1),
    }}
  >
    {children}
  </Typography>
);
