import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioEStepsTitleProps {
  text: string;
}

export const KkStudioEStepsTitle: FC<KkStudioEStepsTitleProps> = ({ text }) => (
  <Typography variant="h3" component="h2" sx={{ flex: 1, minWidth: 0 }}>
    {text}
  </Typography>
);
