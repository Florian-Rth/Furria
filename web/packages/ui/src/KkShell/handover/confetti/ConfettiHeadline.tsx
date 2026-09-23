import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const ConfettiHeadline: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    component="span"
    sx={{
      display: 'block',
      typography: 'h1',
      lineHeight: 1.1,
      letterSpacing: kkTokens.type.tracking.display,
      color: 'text.primary',
      textTransform: 'uppercase',
      textWrap: 'balance',
    }}
  >
    {children}
  </Typography>
);
