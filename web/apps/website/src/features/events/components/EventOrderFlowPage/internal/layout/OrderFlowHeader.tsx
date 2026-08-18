import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OrderFlowHeader: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-order-flow-header sx={{ gap: 2, alignItems: 'flex-start' }}>
    {children}
  </Stack>
);
