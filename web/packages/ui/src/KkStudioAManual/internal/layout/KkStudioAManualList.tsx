import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioAManualList: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="ul" sx={{ m: 0, p: 0 }}>
    {children}
  </Stack>
);
