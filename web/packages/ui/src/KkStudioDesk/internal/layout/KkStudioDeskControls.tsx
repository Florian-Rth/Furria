import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioDeskControls: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}>
    {children}
  </Stack>
);
