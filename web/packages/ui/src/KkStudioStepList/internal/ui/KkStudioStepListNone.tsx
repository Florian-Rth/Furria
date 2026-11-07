import Typography from '@mui/material/Typography';
import type { FC } from 'react';

interface KkStudioStepListNoneProps {
  text: string;
}

export const KkStudioStepListNone: FC<KkStudioStepListNoneProps> = ({ text }) => (
  <Typography
    component="span"
    variant="caption"
    sx={{
      flexShrink: 0,
      width: '5.5rem',
      textAlign: 'center',
      color: 'text.secondary',
      lineHeight: 1.2,
    }}
  >
    {text}
  </Typography>
);
