import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const KkCalendarDetailText: FC<PropsWithChildren> = ({ children }) => (
  <Typography
    component="p"
    variant="body2"
    sx={{ whiteSpace: 'pre-line', color: 'text.secondary', overflowWrap: 'anywhere' }}
  >
    {children}
  </Typography>
);
