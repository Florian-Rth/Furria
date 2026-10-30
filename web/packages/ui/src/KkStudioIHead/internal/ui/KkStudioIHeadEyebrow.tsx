import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkStudioIHeadEyebrowProps {
  text: string;
}

export const KkStudioIHeadEyebrow: FC<KkStudioIHeadEyebrowProps> = ({ text }) => (
  <Typography
    variant="overline"
    data-kk-studio-i-eyebrow
    sx={{
      fontWeight: kkTokens.eyebrow.fontWeight,
      letterSpacing: kkTokens.eyebrow.letterSpacing,
      lineHeight: 1.2,
      color: 'text.secondary',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {text}
  </Typography>
);
