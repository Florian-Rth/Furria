import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormNote: FC<PropsWithChildren> = ({ children }) => (
  <Typography variant="body2" sx={{ color: 'text.secondary', textWrap: 'pretty' }}>
    {children}
  </Typography>
);
