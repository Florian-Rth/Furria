import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroDescription: FC<PropsWithChildren> = ({ children }) => (
  <Typography variant="subtitle1" sx={{ color: 'text.secondary', maxWidth: 'sm', fontWeight: 500 }}>
    {children}
  </Typography>
);
