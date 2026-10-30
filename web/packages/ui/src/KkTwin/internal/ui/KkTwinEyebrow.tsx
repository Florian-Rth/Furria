import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkTwinEyebrowProps {
  text: string;
}

export const KkTwinEyebrow: FC<KkTwinEyebrowProps> = ({ text }) => (
  <Typography
    variant="overline"
    noWrap
    data-kk-twin-eyebrow
    sx={{
      maxWidth: '100%',
      fontWeight: kkTokens.eyebrow.fontWeight,
      letterSpacing: kkTokens.eyebrow.letterSpacing,
      lineHeight: 1.2,
      fontVariantNumeric: 'tabular-nums',
      color: 'text.secondary',
    }}
  >
    {text}
  </Typography>
);
