import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkSessionRowSeason: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    variant="h4"
    component="p"
    data-kk-session-row-season
    sx={{
      letterSpacing: kkTokens.type.tracking.display,
      lineHeight: 1,
      color: 'text.primary',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </Typography>
);
