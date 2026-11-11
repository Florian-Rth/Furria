import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkNamesSheetEmptyProps {
  text: string;
}

export const KkNamesSheetEmpty: FC<KkNamesSheetEmptyProps> = ({ text }) => (
  <Typography
    component="li"
    variant="body2"
    data-kk-names-sheet-empty
    sx={{ color: 'text.secondary', px: 1, py: 1 }}
  >
    {text}
  </Typography>
);
