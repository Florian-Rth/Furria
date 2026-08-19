import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OrderCrossSellBlock: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-order-cross-sell sx={{ gap: 3, maxWidth: { sm: '32rem' } }}>
    {children}
  </Stack>
);
