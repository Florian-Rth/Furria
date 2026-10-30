import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioIHeadTitleProps {
  text: string;
}

export const KkStudioIHeadTitle: FC<KkStudioIHeadTitleProps> = ({ text }) => (
  <Typography
    variant="h3"
    component="h2"
    sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
  >
    {text}
  </Typography>
);
