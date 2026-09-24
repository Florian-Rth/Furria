import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

export const KkShellBarWordmark: FC = () => (
  <Typography
    component="span"
    data-kk-shell-bar-wordmark
    sx={{
      typography: 'h4',
      letterSpacing: kkTokens.type.tracking.label,
      lineHeight: 1.2,
      color: 'text.primary',
      ...lineClamp(1),
    }}
  >
    FURRIA
  </Typography>
);
