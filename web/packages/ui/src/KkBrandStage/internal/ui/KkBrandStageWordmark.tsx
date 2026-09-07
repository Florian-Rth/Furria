import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

export const KkBrandStageWordmark: FC = () => (
  <Typography
    variant="h1"
    component="p"
    data-kk-brand-stage-wordmark
    sx={{
      color: 'text.primary',
      fontSize: kkTokens.headline.page,
      letterSpacing: '0.06em',
      lineHeight: 1,
    }}
  >
    FURRIA
  </Typography>
);
