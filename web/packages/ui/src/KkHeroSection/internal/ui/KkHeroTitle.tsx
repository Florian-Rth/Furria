import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroTitle: FC<PropsWithChildren> = ({ children }) => (
  <Typography variant="poster" component="h1" sx={{ textTransform: 'uppercase' }}>
    {children}
  </Typography>
);
