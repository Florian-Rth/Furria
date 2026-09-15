import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkSheetActions: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-sheet-actions
    sx={{ flexShrink: 0, alignItems: 'center', justifyContent: 'stretch', gap: 1, px: 2.5, pt: 2 }}
  >
    {children}
  </Stack>
);
