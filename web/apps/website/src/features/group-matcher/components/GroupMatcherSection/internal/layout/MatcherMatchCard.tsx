import Card from '@mui/material/Card';
import type { FC, PropsWithChildren } from 'react';

export const MatcherMatchCard: FC<PropsWithChildren> = ({ children }) => (
  <Card sx={{ width: '100%' }}>{children}</Card>
);
