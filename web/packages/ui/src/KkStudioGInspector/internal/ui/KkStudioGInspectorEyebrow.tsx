import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioGInspectorEyebrowProps {
  text: string;
}

export const KkStudioGInspectorEyebrow: FC<KkStudioGInspectorEyebrowProps> = ({ text }) => (
  <Typography
    variant="overline"
    component="h3"
    sx={{
      m: 0,
      fontWeight: kkTokens.eyebrow.fontWeight,
      letterSpacing: kkTokens.eyebrow.letterSpacing,
      lineHeight: 1.2,
      color: 'text.secondary',
    }}
  >
    {text}
  </Typography>
);
