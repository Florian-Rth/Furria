import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkModalFrameBody: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-modal-frame-body sx={{ minWidth: 0, gap: 1, mt: 0.5 }}>
    {children}
  </Stack>
);
