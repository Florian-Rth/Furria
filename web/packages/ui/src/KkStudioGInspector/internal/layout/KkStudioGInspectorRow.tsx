import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioGInspectorRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
    {children}
  </Stack>
);
