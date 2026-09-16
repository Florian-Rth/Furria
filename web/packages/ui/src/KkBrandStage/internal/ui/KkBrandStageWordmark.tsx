import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkBrandStageVariant } from '../brand-stage-variant';

const wordmarkSize: Record<KkBrandStageVariant, string | Record<string, string>> = {
  poster: kkTokens.headline.page,
  band: { xs: kkTokens.headline.compact, desktop: kkTokens.headline.page },
};

interface KkBrandStageWordmarkProps {
  variant?: KkBrandStageVariant;
}

export const KkBrandStageWordmark: FC<KkBrandStageWordmarkProps> = ({ variant = 'poster' }) => (
  <Typography
    variant="h1"
    component="p"
    data-kk-brand-stage-wordmark
    sx={{
      color: 'text.primary',
      fontSize: wordmarkSize[variant],
      letterSpacing: kkTokens.type.tracking.label,
      lineHeight: 1,
    }}
  >
    FURRIA
  </Typography>
);
