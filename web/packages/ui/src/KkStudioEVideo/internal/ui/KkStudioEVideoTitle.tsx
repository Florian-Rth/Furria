import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioEVideoTitleProps {
  text: string;
}

export const KkStudioEVideoTitle: FC<KkStudioEVideoTitleProps> = ({ text }) => (
  <Typography
    variant="subtitle2"
    sx={{
      flex: 1,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }}
  >
    {text}
  </Typography>
);
