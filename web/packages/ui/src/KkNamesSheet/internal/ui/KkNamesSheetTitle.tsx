import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkNamesSheetTitleProps {
  title: string;
}

export const KkNamesSheetTitle: FC<KkNamesSheetTitleProps> = ({ title }) => (
  <Typography variant="h4" component="h2" sx={{ overflowWrap: 'anywhere' }}>
    {title}
  </Typography>
);
