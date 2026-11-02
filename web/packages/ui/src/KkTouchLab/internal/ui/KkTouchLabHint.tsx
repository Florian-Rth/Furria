import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkTouchLabHintProps {
  text: string;
  numeric?: boolean;
  sx?: KkSx;
}

export const KkTouchLabHint: FC<KkTouchLabHintProps> = ({ text, numeric = false, sx }) => (
  <Typography
    variant="caption"
    component="p"
    sx={[
      { color: 'text.secondary', fontVariantNumeric: numeric ? 'tabular-nums' : undefined },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {text}
  </Typography>
);
