import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioIOverviewHeadProps {
  title: string;
  meta: string;
}

export const KkStudioIOverviewHead: FC<KkStudioIOverviewHeadProps> = ({ title, meta }) => (
  <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
    <Typography
      variant="overline"
      component="h3"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1.3,
      }}
    >
      {title}
    </Typography>
    <Typography
      variant="caption"
      sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}
    >
      {meta}
    </Typography>
  </Stack>
);
