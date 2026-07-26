import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroTitle: FC<PropsWithChildren> = ({ children }) => (
  <Typography variant="h1" component="h1" sx={{ textTransform: 'uppercase' }}>
    {children}
  </Typography>
);
