import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioPlacementRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, minWidth: 0 }}>
    {children}
  </Stack>
);
