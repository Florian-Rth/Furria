import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkModalFrameFields: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-modal-frame-fields sx={{ minWidth: 0, gap: 1.5, mt: 1.25 }}>
    {children}
  </Stack>
);
