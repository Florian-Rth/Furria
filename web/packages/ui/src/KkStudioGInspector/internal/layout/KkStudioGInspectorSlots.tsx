import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGInspectorSlots: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" data-kk-studio-g-slots sx={{ flexWrap: 'wrap', gap: 0.5 }}>
    {children}
  </Stack>
);
