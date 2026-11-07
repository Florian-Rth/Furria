import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkSetupTitleProps {
  title: string;
}

export const KkSetupTitle: FC<KkSetupTitleProps> = ({ title }) => (
  <Typography component="h2" variant="h3" noWrap sx={{ minWidth: 0 }}>
    {title}
  </Typography>
);
