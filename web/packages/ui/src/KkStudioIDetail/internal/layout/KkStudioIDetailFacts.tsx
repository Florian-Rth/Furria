import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIDetailFacts: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="dl" sx={{ m: 0, gap: 0.5 }}>
    {children}
  </Stack>
);
