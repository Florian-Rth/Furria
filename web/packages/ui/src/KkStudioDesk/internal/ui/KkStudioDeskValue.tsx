import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioDeskValueProps {
  text: string;
}

export const KkStudioDeskValue: FC<KkStudioDeskValueProps> = ({ text }) => (
  <Typography
    component="span"
    variant="h4"
    aria-live="polite"
    sx={{ minWidth: '6.5rem', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}
  >
    {text}
  </Typography>
);
