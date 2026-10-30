import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkEightsSheetEmptyProps {
  text: string;
}

export const KkEightsSheetEmpty: FC<KkEightsSheetEmptyProps> = ({ text }) => (
  <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 3 }}>
    {text}
  </Typography>
);
