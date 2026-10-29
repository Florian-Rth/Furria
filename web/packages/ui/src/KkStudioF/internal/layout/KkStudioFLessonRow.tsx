import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioFLessonRow: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-studio-f-row
    sx={{ minWidth: 0, alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
  >
    {children}
  </Stack>
);
