import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkSheetBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-sheet-body
    sx={{ minHeight: 0, minWidth: 0, gap: 1.5, px: 2.5, pb: 1, overflowY: 'auto' }}
  >
    {children}
  </Stack>
);
