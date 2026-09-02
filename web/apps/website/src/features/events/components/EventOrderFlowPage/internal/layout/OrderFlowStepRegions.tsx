import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const OrderFlowStepRegions: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-order-flow-step-regions sx={{ gap: { xs: 2, md: 3 } }}>
    {children}
  </Stack>
);
