import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkSsStageTitleProps {
  title: string;
}

export const KkSsStageTitle: FC<KkSsStageTitleProps> = ({ title }) => (
  <Typography component="h2" variant="h3" noWrap sx={{ minWidth: 0 }}>
    {title}
  </Typography>
);
