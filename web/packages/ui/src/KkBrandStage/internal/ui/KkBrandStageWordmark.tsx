import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export const KkBrandStageWordmark: FC = () => (
  <Typography
    variant="display"
    component="p"
    data-kk-brand-stage-wordmark
    sx={{
      color: 'text.primary',
      letterSpacing: kkTokens.type.tracking.label,
      lineHeight: 1,
    }}
  >
    FURRIA
  </Typography>
);
